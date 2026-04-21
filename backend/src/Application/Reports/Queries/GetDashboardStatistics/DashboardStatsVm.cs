namespace backend.Application.Reports.Queries.GetDashboardStatistics;

public class DashboardStatsVm
{
    public int TotalTrees { get; init; }
    public int PendingIncidents { get; init; }
    public int CompletedWorksThisMonth { get; init; }
    public int PendingWorksThisMonth { get; init; }
    public int TotalStreets { get; init; }
    public int TotalWards { get; init; }
    public List<WorkItemBriefDto> OverdueWorks { get; init; } = [];
}

public class WorkItemBriefDto
{
    public int Id { get; init; }
    public string WorkTypeName { get; init; } = null!;
    public DateTime? EndDate { get; init; }
    public string Status { get; init; } = null!;
}
