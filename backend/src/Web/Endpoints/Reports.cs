using backend.Application.Reports.Queries.ExportDashboardStats;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Reports : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder app)
    {
        app.MapGet("dashboard-stats", GetDashboardStats).RequireAuthorization();
        app.MapGet("export", ExportDashboardStats).RequireAuthorization();
    }

    public async Task<Ok<DashboardStatsVm>> GetDashboardStats(ISender sender)
    {
        var result = await sender.Send(new GetDashboardStatisticsQuery());
        return TypedResults.Ok(result);
    }

    public async Task<IResult> ExportDashboardStats(ISender sender)
    {
        var result = await sender.Send(new ExportDashboardStatsQuery());
        return Results.File(result.Content, result.ContentType, result.FileName);
    }
}
