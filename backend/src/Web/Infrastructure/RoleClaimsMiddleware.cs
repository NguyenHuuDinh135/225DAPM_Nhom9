using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace backend.Web.Infrastructure;

public class RoleClaimsMiddleware
{
    private readonly RequestDelegate _next;

    public RoleClaimsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, UserManager<ApplicationUser> userManager)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                // Check if role claims are already present
                if (!context.User.Claims.Any(c => c.Type == ClaimTypes.Role))
                {
                    var user = await userManager.FindByIdAsync(userId);
                    if (user != null)
                    {
                        var roles = await userManager.GetRolesAsync(user);
                        if (roles.Any())
                        {
                            var identity = new ClaimsIdentity(context.User.Identity);
                            foreach (var role in roles)
                            {
                                identity.AddClaim(new Claim(ClaimTypes.Role, role));
                            }
                            context.User = new ClaimsPrincipal(identity);
                        }
                    }
                }
            }
        }

        await _next(context);
    }
}
