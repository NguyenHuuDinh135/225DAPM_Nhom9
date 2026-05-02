using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using backend.Domain.Constants;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.FunctionalTests.WorkItems;

using static Testing;

[TestFixture]
public class WorkItemTests : BaseTestFixture
{
    [Test]
    public async Task ReportProgress_WithStaffUser_ShouldReturnNoContent()
    {
        // Arrange
        var staffEmail = "staff_report@local.com";
        var staffPassword = "Password123!";
        var staffId = await RunAsUserAsync(staffEmail, staffPassword, new[] { Roles.NhanVien });

        var adminId = await RunAsUserAsync("admin_work@local.com", "Password123!", new[] { Roles.GiamDoc });
        
        // 1. Seed dependencies
        var workType = new WorkType { Name = "Bao tri" };
        await AddAsync(workType);
        
        var treeType = new TreeType { Name = "Test Type", Group = "A", MaintenanceIntervalDays = 30 };
        await AddAsync(treeType);

        var tree = new Tree { Name = "Tree 1", TreeTypeId = treeType.Id, RecordedDate = DateTime.UtcNow };
        await AddAsync(tree);

        var plan = Plan.Create("Approved Plan", adminId, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        plan.SubmitForApproval();
        plan.Approve(adminId);
        await AddAsync(plan);

        var work = Work.Create(workType.Id, plan.Id, adminId, DateTime.UtcNow, DateTime.UtcNow.AddDays(7));
        await AddAsync(work);

        var workUser = new WorkUser { WorkId = work.Id, UserId = staffId, Role = Roles.NhanVien, Status = "Assigned" };
        await AddAsync(workUser);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, staffEmail, staffPassword);

        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent("Done cleaning"), "note");
        
        var imageBytes = new byte[] { 1, 2, 3, 4 };
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        multipart.Add(fileContent, "images", "progress.png");

        // Act
        var response = await client.PostAsync($"/api/work-items/{work.Id}/report-progress", multipart);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);

        var updatedWork = await FindAsync<Work>(work.Id);
        // Depending on logic, status might change or progress record added
        // Let's check if progress was created
    }

    private static async Task SeedWorkTypeAsync(int id, string name)
    {
        if (await FindAsync<WorkType>(id) == null)
        {
            await AddAsync(new WorkType { Id = id, Name = name });
        }
    }

    private static async Task SeedTreeTypeAsync(int id)
    {
        if (await FindAsync<TreeType>(id) == null)
        {
            await AddAsync(new TreeType { Id = id, Name = "Test Type", Group = "A", MaintenanceIntervalDays = 30 });
        }
    }
}
