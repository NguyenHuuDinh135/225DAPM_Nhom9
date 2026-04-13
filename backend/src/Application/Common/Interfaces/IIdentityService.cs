using backend.Application.Common.Models;
using backend.Application.Users.Common;

namespace backend.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string?> GetUserNameAsync(string userId);

    Task<bool> IsInRoleAsync(string userId, string role);

    Task<bool> AuthorizeAsync(string userId, string policyName);

    Task<IReadOnlyCollection<UserDto>> GetUsersAsync(CancellationToken cancellationToken);

    Task<UserDto?> GetUserByIdAsync(string userId, CancellationToken cancellationToken);

    Task<bool> EmailExistsAsync(string email, string? excludedUserId, CancellationToken cancellationToken);

    Task<(Result Result, string UserId)> CreateUserAsync(CreateUserModel user, CancellationToken cancellationToken);

    Task<Result> UpdateUserAsync(UpdateUserModel user, CancellationToken cancellationToken);

    Task<Result> UpdateProfileAsync(UpdateProfileModel user, CancellationToken cancellationToken);

    Task<Result> DeleteUserAsync(string userId);
}
