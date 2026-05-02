using backend.Application.Common.Interfaces;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Reports.Queries.GetDashboardStatistics;

public record GetDashboardStatisticsQuery : IRequest<DashboardStatsVm>;

public class GetDashboardStatisticsQueryHandler : IRequestHandler<GetDashboardStatisticsQuery, DashboardStatsVm>
{
    private const string CacheKey = "DashboardStats_Current";
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;

    public GetDashboardStatisticsQueryHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<DashboardStatsVm> Handle(GetDashboardStatisticsQuery request, CancellationToken cancellationToken)
    {
        var cached = await _cache.GetAsync<DashboardStatsVm>(CacheKey);
        if (cached is not null) return cached;

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalTrees = await _context.Trees.AsNoTracking().CountAsync(cancellationToken);
        var totalStreets = await _context.Streets.AsNoTracking().CountAsync(cancellationToken);
        var totalWards = await _context.Wards.AsNoTracking().CountAsync(cancellationToken);

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
                WorkTypeName = w.WorkType != null ? w.WorkType.Name : "Công việc khác",
                EndDate = w.EndDate,
                Status = w.Status.ToString()
            })
            .ToListAsync(cancellationToken);

        var result = new DashboardStatsVm
        {
            TotalTrees = totalTrees,
            TotalStreets = totalStreets,
            TotalWards = totalWards,
            PendingIncidents = pendingIncidents,
            CompletedWorksThisMonth = completedThisMonth,
            PendingWorksThisMonth = pendingThisMonth,
            OverdueWorks = overdueWorks
        };

        await _cache.SetAsync(CacheKey, result, TimeSpan.FromMinutes(5));
        return result;
    }
}
