using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapIdentityApi<ApplicationUser>();

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
                role = roles.FirstOrDefault()
            });
        }).RequireAuthorization();
    }
}
