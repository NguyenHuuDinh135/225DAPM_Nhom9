using backend.Application.Reports.Queries.ExportDashboardStats;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using backend.Application.Reports.Queries.GetMonthlyStats;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Reports : EndpointGroupBase
{
    public override string? GroupName => "reports";

    public override void Map(RouteGroupBuilder app)
    {
        app.MapGet("dashboard-stats", GetDashboardStats).AllowAnonymous();
        app.MapGet("monthly-stats", GetMonthlyStats).AllowAnonymous();
        app.MapGet("export", ExportDashboardStats).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
    }

    public async Task<Ok<DashboardStatsVm>> GetDashboardStats(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetDashboardStatisticsQuery()));

    public async Task<Ok<List<MonthlyStatDto>>> GetMonthlyStats(ISender sender, int months = 6)
        => TypedResults.Ok(await sender.Send(new GetMonthlyStatsQuery(months)));

    public async Task<IResult> ExportDashboardStats(ISender sender)
    {
        var result = await sender.Send(new ExportDashboardStatsQuery());
        return Results.File(result.Content, result.ContentType, result.FileName);
    }
}
