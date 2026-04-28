using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override string? GroupName => "users";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Map default Identity API endpoints
        groupBuilder.MapIdentityApi<ApplicationUser>();

        // Temporary: Disable authorization for testing
        groupBuilder.MapGet("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager) =>
        {
            var user = await userManager.GetUserAsync(principal);
            if (user == null) return Results.Unauthorized();
            var roles = await userManager.GetRolesAsync(user);
            return Results.Ok(new
            {
                id = user.Id,
                email = user.Email,
                name = user.FullName ?? user.UserName,
                fullName = user.FullName,
                dateOfBirth = user.DateOfBirth,
                role = roles.FirstOrDefault()
            });
        }).AllowAnonymous();

        groupBuilder.MapPut("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            UpdateProfileRequest req) =>
        {
            var user = await userManager.GetUserAsync(principal);
            if (user == null) return Results.Unauthorized();
            user.FullName = req.FullName;
            user.DateOfBirth = req.DateOfBirth;
            var result = await userManager.UpdateAsync(user);
            return result.Succeeded ? Results.NoContent() : Results.BadRequest(result.Errors.Select(e => e.Description));
        }).AllowAnonymous();
    }
}

public record UpdateProfileRequest(string? FullName, DateTime? DateOfBirth);
