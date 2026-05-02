using System.Net;
using System.Net.Http.Json;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using backend.Domain.Constants;
using backend.Domain.Entities;

namespace backend.Application.FunctionalTests.Reports;

using static Testing;

[TestFixture]
public class ReportTests : BaseTestFixture
{
    [Test]
    public async Task GetDashboardStats_ShouldReturnCorrectCounts()
    {
        // Arrange
        await SeedDataAsync();
        
        using var client = CreateClient();

        // Act
        var response = await client.GetAsync("/api/reports/dashboard-stats");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var result = await response.Content.ReadFromJsonAsync<DashboardStatsVm>();
        result.ShouldNotBeNull();
        result.TotalTrees.ShouldBeGreaterThanOrEqualTo(2);
        result.PendingIncidents.ShouldBeGreaterThanOrEqualTo(1);
    }

    [Test]
    public async Task ExportDashboardStats_WithAuthorizedUser_ShouldReturnFile()
    {
        // Arrange
        var email = "admin_report@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.GetAsync("/api/reports/export");

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Content.Headers.ContentType?.MediaType.ShouldBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        var bytes = await response.Content.ReadAsByteArrayAsync();
        bytes.Length.ShouldBeGreaterThan(0);
    }

    private static async Task SeedDataAsync()
    {
        var reporterId = await RunAsDefaultUserAsync();
        var treeType = new TreeType { Name = "Test Type", Group = "A", MaintenanceIntervalDays = 30 };
        await AddAsync(treeType);

        await AddAsync(new Tree { Name = "Tree 1", TreeTypeId = treeType.Id, RecordedDate = DateTime.UtcNow });
        await AddAsync(new Tree { Name = "Tree 2", TreeTypeId = treeType.Id, RecordedDate = DateTime.UtcNow });

        var tree = new Tree { Name = "Tree 3", TreeTypeId = treeType.Id, RecordedDate = DateTime.UtcNow };
        await AddAsync(tree);
        
        await AddAsync(TreeIncident.Create(tree.Id, reporterId, "Broken branch"));
    }
}
