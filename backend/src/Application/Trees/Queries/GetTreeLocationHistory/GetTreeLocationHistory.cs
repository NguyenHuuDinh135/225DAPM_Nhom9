using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Queries.GetTreeLocationHistory;

public record GetTreeLocationHistoryQuery(int TreeId) : IRequest<List<TreeLocationHistoryDto>>;

public class TreeLocationHistoryDto
{
    public int LocationId { get; init; }
    public string? StreetName { get; init; }
    public int? HouseNumber { get; init; }
    public DateTime FromDate { get; init; }
    public DateTime? ToDate { get; init; }
}

public class GetTreeLocationHistoryQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTreeLocationHistoryQuery, List<TreeLocationHistoryDto>>
{
    public async Task<List<TreeLocationHistoryDto>> Handle(GetTreeLocationHistoryQuery request, CancellationToken cancellationToken)
        => await context.TreeLocationHistories
            .AsNoTracking()
            .Include(h => h.Location).ThenInclude(l => l.Street)
            .Where(h => h.TreeId == request.TreeId)
            .OrderByDescending(h => h.FromDate)
            .Select(h => new TreeLocationHistoryDto
            {
                LocationId = h.LocationId,
                StreetName = h.Location.Street.Name,
                HouseNumber = h.Location.HouseNumber,
                FromDate = h.FromDate,
                ToDate = h.ToDate
            })
            .ToListAsync(cancellationToken);
}
