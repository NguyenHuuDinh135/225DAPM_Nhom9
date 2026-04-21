using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.Reports.Queries.GetMonthlyStats;

public record GetMonthlyStatsQuery(int Months = 6) : IRequest<List<MonthlyStatDto>>;

public class MonthlyStatDto
{
    public string Month { get; init; } = null!; // "yyyy-MM"
    public int CompletedWorks { get; init; }
    public int NewIncidents { get; init; }
}

public class GetMonthlyStatsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetMonthlyStatsQuery, List<MonthlyStatDto>>
{
    public async Task<List<MonthlyStatDto>> Handle(GetMonthlyStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var result = new List<MonthlyStatDto>();

        for (int i = request.Months - 1; i >= 0; i--)
        {
            var month = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-i);
            var next = month.AddMonths(1);

            var completed = await context.Works.AsNoTracking()
                .CountAsync(w => w.Status == WorkStatus.Completed
                    && w.EndDate >= month && w.EndDate < next, cancellationToken);

            var incidents = await context.TreeIncidents.AsNoTracking()
                .CountAsync(inc => inc.ReportedDate >= month && inc.ReportedDate < next, cancellationToken);

            result.Add(new MonthlyStatDto
            {
                Month = month.ToString("yyyy-MM"),
                CompletedWorks = completed,
                NewIncidents = incidents,
            });
        }

        return result;
    }
}
