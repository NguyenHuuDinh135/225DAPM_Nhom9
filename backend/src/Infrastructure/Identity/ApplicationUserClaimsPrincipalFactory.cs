using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace backend.Infrastructure.Identity;

public class ApplicationUserClaimsPrincipalFactory : UserClaimsPrincipalFactory<ApplicationUser, IdentityRole>
{
    public ApplicationUserClaimsPrincipalFactory(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
<<<<<<< HEAD
        IOptions<IdentityOptions> optionsAccessor)
        : base(userManager, roleManager, optionsAccessor)
=======
        IOptions<IdentityOptions> options)
        : base(userManager, roleManager, options)
>>>>>>> main
    {
    }

    protected override async Task<ClaimsIdentity> GenerateClaimsAsync(ApplicationUser user)
    {
        var identity = await base.GenerateClaimsAsync(user);
<<<<<<< HEAD

        // Explicitly add roles as claims if they aren't there yet
=======
        
        // Add role claims
>>>>>>> main
        var roles = await UserManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            identity.AddClaim(new Claim(ClaimTypes.Role, role));
        }
<<<<<<< HEAD

        // Add additional useful claims
        if (!string.IsNullOrEmpty(user.FullName))
            identity.AddClaim(new Claim("name", user.FullName));
            
        if (!string.IsNullOrEmpty(user.AvatarUrl))
            identity.AddClaim(new Claim("avatar", user.AvatarUrl));

=======
        
>>>>>>> main
        return identity;
    }
}
