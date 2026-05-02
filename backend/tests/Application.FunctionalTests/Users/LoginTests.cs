using System.Net;
using System.Net.Http.Json;
using backend.Web.Endpoints;

namespace backend.Application.FunctionalTests.Users;

using static Testing;

[TestFixture]
public class LoginTests : BaseTestFixture
{
    [Test]
    public async Task Login_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange
        var email = "testuser@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, Array.Empty<string>());
        
        using var client = CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/users/login", new LoginRequest(email, password));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        
        var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
        result?.AccessToken.ShouldNotBeNullOrEmpty();
    }

    private record LoginResponse(string AccessToken, string TokenType, int ExpiresIn);

    [Test]
    public async Task Login_WithInvalidPassword_ShouldReturnUnauthorized()
    {
        // Arrange
        var email = "wrongpass@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, Array.Empty<string>());
        
        using var client = CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/users/login", new LoginRequest(email, "WrongPassword!"));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Login_WithNonExistentUser_ShouldReturnUnauthorized()
    {
        // Arrange
        using var client = CreateClient();

        // Act
        var response = await client.PostAsJsonAsync("/api/users/login", new LoginRequest("nonexistent@local.com", "Password123!"));

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
