using backend.Application.Common.Interfaces;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override string? GroupName => "users";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
<<<<<<< HEAD
        groupBuilder.MapPost("/login", async (
            [FromBody] LoginRequest request,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration) =>
        {
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
            {
                return Results.Unauthorized();
            }

            var roles = await userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email!),
                new(ClaimTypes.Name, user.FullName ?? user.UserName!)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? "YourSuperSecretKeyWithAtLeast32Characters!"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return Results.Ok(new
            {
                accessToken = new JwtSecurityTokenHandler().WriteToken(token),
                tokenType = "Bearer",
                expiresIn = 3600 * 24 * 7
            });
        });
=======
        // Map default Identity API endpoints
        groupBuilder.MapIdentityApi<ApplicationUser>();
>>>>>>> main

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
                avatarUrl = user.AvatarUrl,
                dateOfBirth = user.DateOfBirth,
                role = roles.FirstOrDefault()
            });
        }).AllowAnonymous();

        groupBuilder.MapPut("/me", async (
            ClaimsPrincipal principal,
            UserManager<ApplicationUser> userManager,
            IFileService fileService,
            [FromForm] UpdateProfileRequest request) =>
        {
            var user = await userManager.GetUserAsync(principal);
            if (user == null) return Results.Unauthorized();
            
            user.FullName = request.FullName;
            user.DateOfBirth = request.DateOfBirth.HasValue 
                ? DateTime.SpecifyKind(request.DateOfBirth.Value, DateTimeKind.Utc) 
                : null;

            if (request.Avatar != null)
            {
                user.AvatarUrl = await fileService.UploadAsync(request.Avatar, "avatars");
            }

            var result = await userManager.UpdateAsync(user);
            return result.Succeeded ? Results.NoContent() : Results.BadRequest(result.Errors.Select(e => e.Description));
<<<<<<< HEAD
        }).RequireAuthorization().DisableAntiforgery();
=======
        }).AllowAnonymous();
>>>>>>> main
    }
}

public record LoginRequest(string Email, string Password);
public class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public IFormFile? Avatar { get; set; }
}
