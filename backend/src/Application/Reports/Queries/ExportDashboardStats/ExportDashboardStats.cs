using backend.Application.Common.Interfaces;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using backend.Domain.Enums;

namespace backend.Application.Reports.Queries.ExportDashboardStats;

public record ExportDashboardStatsQuery : IRequest<ExportDashboardStatsResult>;

public class ExportDashboardStatsResult
{
    public byte[] Content { get; init; } = [];
    public string ContentType { get; init; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public string FileName { get; init; } = null!;
}

public class ExportDashboardStatsQueryHandler : IRequestHandler<ExportDashboardStatsQuery, ExportDashboardStatsResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IExcelService _excel;

    public ExportDashboardStatsQueryHandler(IApplicationDbContext context, IExcelService excel)
    {
        _context = context;
        _excel = excel;
    }

    public async Task<ExportDashboardStatsResult> Handle(ExportDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalTrees = await _context.Trees.AsNoTracking().CountAsync(cancellationToken);

        var pendingIncidents = await _context.TreeIncidents.AsNoTracking()
            .CountAsync(i => i.Status == "Pending", cancellationToken);

        var completedThisMonth = await _context.Works.AsNoTracking()
            .CountAsync(w => w.Status == WorkStatus.Completed && w.EndDate >= startOfMonth && w.EndDate < now, cancellationToken);

        var pendingThisMonth = await _context.Works.AsNoTracking()
            .CountAsync(w => (w.Status == WorkStatus.New || w.Status == WorkStatus.InProgress || w.Status == WorkStatus.WaitingForApproval)
                             && w.EndDate >= startOfMonth && w.EndDate < now.AddMonths(1), cancellationToken);

        var overdueWorks = await _context.Works.AsNoTracking()
            .Include(w => w.WorkType)
            .Where(w => w.EndDate < now && w.Status != WorkStatus.Completed && w.Status != WorkStatus.Cancelled)
            .Select(w => new WorkItemBriefDto
            {
                Id = w.Id,
                WorkTypeName = w.WorkType.Name,
                EndDate = w.EndDate,
                Status = w.Status.ToString()
            })
            .ToListAsync(cancellationToken);

        var stats = new DashboardStatsVm
        {
            TotalTrees = totalTrees,
            PendingIncidents = pendingIncidents,
            CompletedWorksThisMonth = completedThisMonth,
            PendingWorksThisMonth = pendingThisMonth,
            OverdueWorks = overdueWorks
        };

        var bytes = await _excel.ExportDashboardStatsAsync(stats);

        return new ExportDashboardStatsResult
        {
            Content = bytes,
            FileName = $"BaoCaoCayXanh_Thang{now.Month}_{now.Year}.xlsx"
        };
    }
}
