using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Web.Endpoints;

namespace backend.Application.FunctionalTests.Users;

using static Testing;

[TestFixture]
public class ProfileTests : BaseTestFixture
{
    [Test]
    public async Task GetMe_WithValidToken_ShouldReturnUserProfile()
    {
        // Arrange
        var email = "profile@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, Array.Empty<string>());
        
        using var client = CreateClient();

        // 1. Login to get token
        var loginResponse = await client.PostAsJsonAsync("/api/users/login", new LoginRequest(email, password));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        var token = loginResult!.AccessToken;

        // 2. Set Authorization header
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await client.GetAsync("/api/users/me");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var profile = await response.Content.ReadFromJsonAsync<UserProfileResponse>();
        profile!.Email.ShouldBe(email);
    }

    [Test]
    public async Task UpdateMe_WithMultipartData_ShouldUpdateProfile()
    {
        // Arrange
        var email = "update@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, Array.Empty<string>());
        
        using var client = CreateClient();

        // 1. Login to get token
        var loginResponse = await client.PostAsJsonAsync("/api/users/login", new LoginRequest(email, password));
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<LoginResponse>();
        var token = loginResult!.AccessToken;
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // 2. Prepare multipart content
        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent("Nguyen Van A"), "FullName");
        multipart.Add(new StringContent("1990-01-01"), "DateOfBirth");
        
        var imageBytes = new byte[] { 1, 2, 3, 4 };
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        multipart.Add(fileContent, "Avatar", "avatar.png");

        // Act
        var response = await client.PutAsync("/api/users/me", multipart);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        // Verify changes
        var getResponse = await client.GetAsync("/api/users/me");
        var profile = await getResponse.Content.ReadFromJsonAsync<UserProfileResponse>();
        profile!.FullName.ShouldBe("Nguyen Van A");
        profile.AvatarUrl.ShouldNotBeNullOrEmpty();
    }

    private record LoginResponse(string AccessToken, string TokenType, int ExpiresIn);
    private record UserProfileResponse(string Id, string Email, string FullName, string? AvatarUrl, DateTime? DateOfBirth);
}
