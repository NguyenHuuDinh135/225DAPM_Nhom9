using backend.Application.Reports.Queries.GetDashboardStatistics;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Reports : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder app)
    {
        app.MapGet("dashboard-stats", GetDashboardStats).RequireAuthorization();
    }

    public async Task<Ok<DashboardStatsVm>> GetDashboardStats(ISender sender)
    {
        var result = await sender.Send(new GetDashboardStatisticsQuery());
        return TypedResults.Ok(result);
    }
}
