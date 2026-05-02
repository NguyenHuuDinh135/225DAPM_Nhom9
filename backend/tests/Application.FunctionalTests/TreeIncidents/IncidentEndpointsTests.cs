using System.Net;
using System.Net.Http.Json;
using backend.Domain.Entities;

namespace backend.Application.FunctionalTests.TreeIncidents;

using static Testing;

[TestFixture]
public class IncidentEndpointsTests : BaseTestFixture
{
    [Test]
    public async Task CreateIncident_WithJsonPayload_ShouldCreateIncident()
    {
        var treeId = await SeedTreeAsync();
        var userId = await RunAsDefaultUserAsync();
        using var client = CreateClient();

        var payload = new
        {
            treeId,
            reporterId = userId,
            content = "Broken branch"
        };

        var response = await client.PostAsJsonAsync("/api/tree-incidents", payload);

        if (response.StatusCode != HttpStatusCode.OK)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Create incident failed with {response.StatusCode}. Error: {error}");
        }
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var createdId = await response.Content.ReadFromJsonAsync<int?>();
        createdId.ShouldNotBeNull();
        createdId.Value.ShouldBeGreaterThan(0);
    }

    [Test]
    public async Task CreateIncident_WithMissingReporterId_ShouldReturnBadRequest()
    {
        var treeId = await SeedTreeAsync();
        using var client = CreateClient();

        var payload = new
        {
            treeId,
            reporterId = "",
            content = "Missing reporter"
        };

        var response = await client.PostAsJsonAsync("/api/tree-incidents", payload);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }

    [Test]
    public async Task ReportIncident_WithMultipartPayload_ShouldCreateIncident()
    {
        var treeId = await SeedTreeAsync();
        using var client = CreateClient();

        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent(treeId.ToString()), "TreeId");
        multipart.Add(new StringContent("Citizen report"), "Content");
        multipart.Add(new StringContent("0900000000"), "ReporterPhone");
        multipart.Add(new StringContent("Reporter Name"), "ReporterName");

        var imageBytes = new byte[] { 1, 2, 3, 4 };
        var fileContent = new ByteArrayContent(imageBytes);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        multipart.Add(fileContent, "Images", "evidence.png");

        var response = await client.PostAsync("/api/tree-incidents/report-incident", multipart);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var createdId = await response.Content.ReadFromJsonAsync<int?>();
        createdId.ShouldNotBeNull();
        createdId.Value.ShouldBeGreaterThan(0);
    }

    [Test]
    public async Task ReportIncident_WithInvalidTreeId_ShouldReturnBadRequest()
    {
        using var client = CreateClient();
        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent("0"), "TreeId");
        multipart.Add(new StringContent("Invalid tree"), "Content");

        var response = await client.PostAsync("/api/tree-incidents/report-incident", multipart);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var content = await response.Content.ReadAsStringAsync();
        content.ShouldContain("errors", Case.Insensitive);
    }

    [Test]
    public async Task ReportIncident_WithEmergencyKeywords_ShouldBeClassifiedAsEmergency()
    {
        var treeId = await SeedTreeAsync();
        using var client = CreateClient();

        using var multipart = new MultipartFormDataContent();
        multipart.Add(new StringContent(treeId.ToString()), "TreeId");
        multipart.Add(new StringContent("Cây ngã đè lên ô tô rất nguy hiểm"), "Content");
        multipart.Add(new StringContent("0912345678"), "ReporterPhone");

        var response = await client.PostAsync("/api/tree-incidents/report-incident", multipart);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var createdId = await response.Content.ReadFromJsonAsync<int>();

        var incident = await FindAsync<TreeIncident>(createdId);
        incident!.Severity.ShouldBe("Khẩn cấp");
    }

    private static async Task<int> SeedTreeAsync()
    {
        var treeType = new TreeType
        {
            Name = "Test tree type",
            Group = "A",
            MaintenanceIntervalDays = 30
        };
        await AddAsync(treeType);

        var tree = new Tree
        {
            Name = "Test Tree",
            TreeTypeId = treeType.Id,
            Condition = "Good",
            RecordedDate = DateTime.UtcNow
        };
        await AddAsync(tree);

        return tree.Id;
    }
}
