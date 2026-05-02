using System.Net;
using System.Net.Http.Json;
using backend.Application.Planning.Commands.CreatePlan;
using backend.Domain.Constants;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.FunctionalTests.Planning;

using static Testing;

[TestFixture]
public class PlanningTests : BaseTestFixture
{
    [Test]
    public async Task CreatePlan_ShouldReturnId()
    {
        // Arrange
        var email = "planner@local.com";
        var password = "Password123!";
        var userId = await RunAsUserAsync(email, password, new[] { Roles.DoiTruong });
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        var command = new CreatePlanCommand
        {
            Name = "Ke hoach bao tri thang 5",
            CreatorId = userId,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc)
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/planning", command);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Created);
        var id = await response.Content.ReadFromJsonAsync<int>();
        id.ShouldBeGreaterThan(0);
    }

    [Test]
    public async Task SubmitPlan_ShouldChangeStatusToPendingApproval()
    {
        // Arrange
        var email = "planner_submit@local.com";
        var password = "Password123!";
        var userId = await RunAsUserAsync(email, password, new[] { Roles.DoiTruong });
        
        var plan = Plan.Create("Draft Plan", userId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsync($"/api/planning/{plan.Id}/submit", null);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        
        var updatedPlan = await FindAsync<Plan>(plan.Id);
        updatedPlan!.Status.ShouldBe(PlanStatus.PendingApproval);
    }

    [Test]
    public async Task ApprovePlan_AsGiamDoc_ShouldChangeStatusToApproved()
    {
        // Arrange
        var email = "director@local.com";
        var password = "Password123!";
        var userId = await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        
        // We need a creator too
        var creatorId = await RunAsUserAsync("creator@local.com", "Password123!", new[] { Roles.DoiTruong });

        var plan = Plan.Create("Pending Plan", creatorId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        plan.SubmitForApproval();
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsJsonAsync($"/api/planning/{plan.Id}/approve", new { note = "Approved" });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        
        var updatedPlan = await FindAsync<Plan>(plan.Id);
        updatedPlan!.Status.ShouldBe(PlanStatus.Approved);
        updatedPlan.ApproverId.ShouldBe(userId);
    }

    [Test]
    public async Task ApprovePlan_AsDoiTruong_ShouldReturnForbidden()
    {
        // Arrange
        var email = "staff_approve@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.DoiTruong });
        
        var creatorId = await RunAsUserAsync("creator2@local.com", "Password123!", new[] { Roles.DoiTruong });
        var plan = Plan.Create("Pending Plan 2", creatorId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        plan.SubmitForApproval();
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsJsonAsync($"/api/planning/{plan.Id}/approve", new { note = "Illegal" });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }

    [Test]
    public async Task RejectPlan_AsGiamDoc_ShouldChangeStatusToRejected()
    {
        // Arrange
        var email = "director_reject@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        
        var creatorId = await RunAsUserAsync("creator3@local.com", "Password123!", new[] { Roles.DoiTruong });
        var plan = Plan.Create("Plan to Reject", creatorId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        plan.SubmitForApproval();
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsJsonAsync($"/api/planning/{plan.Id}/reject", new { reason = "Too expensive" });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        
        var updatedPlan = await FindAsync<Plan>(plan.Id);
        updatedPlan!.Status.ShouldBe(PlanStatus.Rejected);
        updatedPlan.RejectionReason.ShouldBe("Too expensive");
    }

    [Test]
    public async Task RequestRevision_AsGiamDoc_ShouldChangeStatusToNeedsRevision()
    {
        // Arrange
        var email = "director_rev@local.com";
        var password = "Password123!";
        await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        
        var creatorId = await RunAsUserAsync("creator4@local.com", "Password123!", new[] { Roles.DoiTruong });
        var plan = Plan.Create("Plan to Revise", creatorId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        plan.SubmitForApproval();
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsJsonAsync($"/api/planning/{plan.Id}/request-revision", new { reason = "Clarify scope" });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        
        var updatedPlan = await FindAsync<Plan>(plan.Id);
        updatedPlan!.Status.ShouldBe(PlanStatus.NeedsRevision);
        updatedPlan.RejectionReason.ShouldBe("Clarify scope");
    }

    [Test]
    public async Task UpdatePlan_AfterRequestRevision_ShouldBeAllowed()
    {
        // Arrange
        var email = "planner_update@local.com";
        var password = "Password123!";
        var userId = await RunAsUserAsync(email, password, new[] { Roles.DoiTruong });
        
        var plan = Plan.Create("Plan needs revision", userId, 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc), 
            DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc));
        plan.SubmitForApproval();
        plan.RequestRevision("Need fix");
        await AddAsync(plan);

        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        // Act
        var response = await client.PutAsJsonAsync($"/api/planning/{plan.Id}", new { name = "Fixed Plan" });

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.NoContent);
        
        var updatedPlan = await FindAsync<Plan>(plan.Id);
        updatedPlan!.Name.ShouldBe("Fixed Plan");
    }

    [Test]
    public async Task CreatePlan_AsGiamDoc_ShouldReturnForbidden()
    {
        // Arrange
        var email = "director_create@local.com";
        var password = "Password123!";
        var userId = await RunAsUserAsync(email, password, new[] { Roles.GiamDoc });
        
        using var client = CreateClient();
        await AuthorizeClientAsync(client, email, password);

        var command = new CreatePlanCommand
        {
            Name = "Illegal Director Plan",
            CreatorId = userId,
            StartDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(1), DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(DateTime.UtcNow.AddDays(7), DateTimeKind.Utc)
        };

        // Act
        var response = await client.PostAsJsonAsync("/api/planning", command);

        // Assert
        response.StatusCode.ShouldBe(HttpStatusCode.Forbidden);
    }
}
