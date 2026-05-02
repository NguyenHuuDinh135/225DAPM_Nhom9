using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Application.Common.Models;
using backend.Application.Trees.Queries.GetTrees;
using backend.Domain.Constants;
using backend.Domain.Entities;
using backend.Web.Endpoints;

namespace backend.Application.FunctionalTests.Trees;

using static Testing;

[TestFixture]
public class TreeTests : BaseTestFixture
{
    [Test]
    public async Task GetTrees_ShouldReturnPaginatedList()
    {
        // Arrange
        await SeedTreeTypeAsync(1);
        await AddAsync(new Tree { Name = "Tree 1", TreeTypeId = 1, RecordedDate = DateTime.UtcNow });
        await AddAsync(new Tree { Name = "Tree 2", TreeTypeId = 1, RecordedDate = DateTime.UtcNow });
        
        using var client = CreateClient();

        // Act
        var response = await client.GetAsync("/api/trees?pageSize=10");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<PaginatedList<TreeDto>>();
        result.ShouldNotBeNull();
        result.TotalCount.ShouldBeGreaterThanOrEqualTo(2);
    }

    [Test]
    public async Task CreateTree_WithAuthorizedUser_ShouldReturnCreated()
    {
        // Arrange
        var email = "admin@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.GiamDoc }); 
        await SeedTreeTypeAsync(1);
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        var command = new
        {
            name = "New Tree",
            treeTypeId = 1,
            condition = "Good"
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/trees", command);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var id = await response.Content.ReadFromJsonAsync<int>();
        id.ShouldBeGreaterThan(0);
    }

    [Test]
    public async Task CreateTree_WithUnauthorizedUser_ShouldReturnForbidden()
    {
        // Arrange
        var email = "staff@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.NhanVien });
        await SeedTreeTypeAsync(1);
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        var command = new { name = "Unauthorized", treeTypeId = 1 };

        // Act
        var response = await client.PostAsJsonAsync("/api/trees", command);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task ImportTrees_WithAuthorizedUser_ShouldReturnNoContent()
    {
        // Arrange
        var email = "admin_import@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        await SeedTreeTypeAsync(1);
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        using var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(new byte[] { 1, 2, 3 });
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        content.Add(fileContent, "file", "test.xlsx");

        // Act
        var response = await client.PostAsync("/api/trees/import", content);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        var count = await CountAsync<Tree>();
        count.ShouldBeGreaterThanOrEqualTo(2); // From the mock ExcelService
    }

    private static async Task SeedTreeTypeAsync(int id)
    {
        if (await FindAsync<TreeType>(id) == null)
        {
            await AddAsync(new TreeType 
            { 
                Id = id, 
                Name = "Test Type", 
                Group = "A", 
                MaintenanceIntervalDays = 30 
            });
        }
    }
}
