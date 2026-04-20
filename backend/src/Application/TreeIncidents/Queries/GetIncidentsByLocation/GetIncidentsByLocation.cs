using backend.Application.Common.Interfaces;

namespace backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

public record GetIncidentsByLocationQuery : IRequest<List<TreeIncidentDto>>
{
    public int LocationId { get; init; }
}

public class GetIncidentsByLocationQueryHandler : IRequestHandler<GetIncidentsByLocationQuery, List<TreeIncidentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetIncidentsByLocationQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TreeIncidentDto>> Handle(GetIncidentsByLocationQuery request, CancellationToken cancellationToken)
    {
        return await _context.TreeIncidents
            .AsNoTracking()
            .Include(i => i.Tree)
                .ThenInclude(t => t.TreeLocationHistories)
            .Where(i => i.Status != "Resolved"
                && i.Tree.TreeLocationHistories.Any(h => h.LocationId == request.LocationId && h.ToDate == null))
            .Select(i => new TreeIncidentDto
            {
                Id = i.Id,
                TreeId = i.TreeId,
                TreeName = i.Tree.Name,
                Description = i.Content,
                ReportedDate = i.ReportedDate ?? DateTime.UtcNow,
                ReportedBy = i.ReporterName ?? i.ReporterId
            })
            .ToListAsync(cancellationToken);
    }
}
