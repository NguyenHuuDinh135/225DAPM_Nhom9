using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;

namespace backend.Infrastructure.Identity;

public class ClaimsTransformation(UserManager<ApplicationUser> userManager) : IClaimsTransformation
{
    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        // Check if we already have the roles in the principal
        if (principal.HasClaim(c => c.Type == ClaimTypes.Role))
            return principal;

        var user = await userManager.GetUserAsync(principal);
        if (user == null) return principal;

        var roles = await userManager.GetRolesAsync(user);
        if (roles.Count == 0) return principal;

        var identity = (ClaimsIdentity)principal.Identity!;
        foreach (var role in roles)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }

        return principal;
    }
}
