using System.Net;

namespace backend.Application.FunctionalTests.Lookups;

using static Testing;

[TestFixture]
public class LookupEndpointsTests : BaseTestFixture
{
    [Test]
    public async Task GetTreeTypes_ShouldReturnOk_WithoutAuthentication()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/api/lookups/tree-types");

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Test]
    public async Task GetWards_ShouldRequireAuthentication()
    {
        using var client = CreateClient();

        var response = await client.GetAsync("/api/lookups/wards");

        response.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}
