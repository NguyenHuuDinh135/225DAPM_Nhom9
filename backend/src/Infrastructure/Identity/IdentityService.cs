using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Application.Users.Common;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IUserClaimsPrincipalFactory<ApplicationUser> _userClaimsPrincipalFactory;
    private readonly IAuthorizationService _authorizationService;

    public IdentityService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IUserClaimsPrincipalFactory<ApplicationUser> userClaimsPrincipalFactory,
        IAuthorizationService authorizationService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _userClaimsPrincipalFactory = userClaimsPrincipalFactory;
        _authorizationService = authorizationService;
    }

    public async Task<string?> GetUserNameAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user?.UserName;
    }

    public async Task<IReadOnlyCollection<UserDto>> GetUsersAsync(CancellationToken cancellationToken)
    {
        var users = await _userManager.Users
            .AsNoTracking()
            .Include(u => u.Ward)
            .OrderBy(u => u.FullName ?? u.Email)
            .ThenBy(u => u.Email)
            .ToListAsync(cancellationToken);

        var results = new List<UserDto>(users.Count);

        foreach (var user in users)
        {
            results.Add(await MapUserAsync(user));
        }

        return results;
    }

    public async Task<UserDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.Users
            .AsNoTracking()
            .Include(u => u.Ward)
            .SingleOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return user is null ? null : await MapUserAsync(user);
    }

    public async Task<bool> EmailExistsAsync(string email, string? excludedUserId, CancellationToken cancellationToken)
    {
        var normalizedEmail = email.Trim().ToUpperInvariant();

        return await _userManager.Users
            .AnyAsync(u => u.NormalizedEmail == normalizedEmail && (excludedUserId == null || u.Id != excludedUserId), cancellationToken);
    }

    public async Task<(Result Result, string UserId)> CreateUserAsync(CreateUserModel request, CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            WardId = request.WardId,
            Status = request.Status
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return (result.ToApplicationResult(), user.Id);
        }

        var syncRolesResult = await SyncRolesAsync(user, request.Roles);

        if (!syncRolesResult.Succeeded)
        {
            await DeleteUserAsync(user);
            return (syncRolesResult, user.Id);
        }

        return (Result.Success(), user.Id);
    }

    public async Task<Result> UpdateUserAsync(UpdateUserModel request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id);

        if (user is null)
        {
            return Result.Failure(new[] { "User was not found." });
        }

        user.UserName = request.Email;
        user.Email = request.Email;
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.DateOfBirth = request.DateOfBirth;
        user.WardId = request.WardId;
        user.Status = request.Status;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return result.ToApplicationResult();
        }

        return await SyncRolesAsync(user, request.Roles);
    }

    public async Task<Result> UpdateProfileAsync(UpdateProfileModel request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.Id);

        if (user is null)
        {
            return Result.Failure(new[] { "User was not found." });
        }

        user.UserName = request.Email;
        user.Email = request.Email;
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.DateOfBirth = request.DateOfBirth;
        user.WardId = request.WardId;

        var result = await _userManager.UpdateAsync(user);

        return result.ToApplicationResult();
    }

    public async Task<bool> IsInRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null && await _userManager.IsInRoleAsync(user, role);
    }

    public async Task<bool> AuthorizeAsync(string userId, string policyName)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return false;
        }

        var principal = await _userClaimsPrincipalFactory.CreateAsync(user);

        var result = await _authorizationService.AuthorizeAsync(principal, policyName);

        return result.Succeeded;
    }

    public async Task<Result> DeleteUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        return user != null ? await DeleteUserAsync(user) : Result.Failure(new[] { "User was not found." });
    }

    public async Task<Result> DeleteUserAsync(ApplicationUser user)
    {
        try
        {
            var result = await _userManager.DeleteAsync(user);

            return result.ToApplicationResult();
        }
        catch (DbUpdateException)
        {
            return Result.Failure(new[] { "Cannot delete user because it is referenced by existing records." });
        }
    }

    private async Task<UserDto> MapUserAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
            WardId = user.WardId,
            WardName = user.Ward?.Name,
            Status = user.Status,
            EmailConfirmed = user.EmailConfirmed,
            Roles = roles.ToArray()
        };
    }

    private async Task<Result> SyncRolesAsync(ApplicationUser user, IEnumerable<string> roles)
    {
        var desiredRoles = roles
            .Select(NormalizeRole)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var ensureRolesResult = await EnsureRolesExistAsync(desiredRoles);

        if (!ensureRolesResult.Succeeded)
        {
            return ensureRolesResult;
        }

        var currentRoles = await _userManager.GetRolesAsync(user);

        var rolesToAdd = desiredRoles
            .Except(currentRoles, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var rolesToRemove = currentRoles
            .Except(desiredRoles, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (rolesToAdd.Length > 0)
        {
            var addResult = await _userManager.AddToRolesAsync(user, rolesToAdd);

            if (!addResult.Succeeded)
            {
                return addResult.ToApplicationResult();
            }
        }

        if (rolesToRemove.Length > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemove);

            if (!removeResult.Succeeded)
            {
                return removeResult.ToApplicationResult();
            }
        }

        return Result.Success();
    }

    private async Task<Result> EnsureRolesExistAsync(IEnumerable<string> roles)
    {
        foreach (var role in roles)
        {
            if (await _roleManager.RoleExistsAsync(role))
            {
                continue;
            }

            var createRoleResult = await _roleManager.CreateAsync(new IdentityRole(role));

            if (!createRoleResult.Succeeded)
            {
                return createRoleResult.ToApplicationResult();
            }
        }

        return Result.Success();
    }

    private static string NormalizeRole(string role)
    {
        return role.Equals(Roles.Administrator, StringComparison.OrdinalIgnoreCase)
            ? Roles.Administrator
            : role;
    }
}
