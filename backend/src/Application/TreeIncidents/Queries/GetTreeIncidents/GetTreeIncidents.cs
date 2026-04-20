using backend.Application.Common.Interfaces;
using backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

namespace backend.Application.TreeIncidents.Queries.GetTreeIncidents;

public record GetTreeIncidentsQuery : IRequest<TreeIncidentsVm>
{
}

public class GetTreeIncidentsQueryValidator : AbstractValidator<GetTreeIncidentsQuery>
{
    public GetTreeIncidentsQueryValidator()
    {
    }
}

public class GetTreeIncidentsQueryHandler : IRequestHandler<GetTreeIncidentsQuery, TreeIncidentsVm>
{
    private readonly IApplicationDbContext _context;

    public GetTreeIncidentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeIncidentsVm> Handle(GetTreeIncidentsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.TreeIncidents
            .AsNoTracking()
            .Include(i => i.Tree)
            .OrderByDescending(i => i.ReportedDate)
            .Select(i => new TreeIncidentDto
            {
                Id = i.Id,
                TreeId = i.TreeId,
                TreeName = i.Tree.Name,
                Description = i.Content,
                Status = i.Status,
                ReportedDate = i.ReportedDate ?? DateTime.UtcNow,
                ReportedBy = i.ReporterName ?? i.ReporterId
            })
            .ToListAsync(cancellationToken);

        return new TreeIncidentsVm { TreeIncidents = items };
    }
}
