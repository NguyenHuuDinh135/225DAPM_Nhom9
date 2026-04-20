using backend.Application.Common.Interfaces;

namespace backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;

public record GetTreeIncidentDetailQuery : IRequest<TreeIncidentDetailDto>
{
    public int Id { get; init; }
}

public class GetTreeIncidentDetailQueryHandler : IRequestHandler<GetTreeIncidentDetailQuery, TreeIncidentDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetTreeIncidentDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeIncidentDetailDto> Handle(GetTreeIncidentDetailQuery request, CancellationToken cancellationToken)
    {
        var incident = await _context.TreeIncidents
            .AsNoTracking()
            .Include(i => i.Tree)
            .Include(i => i.Images)
            .Where(i => i.Id == request.Id)
            .Select(i => new TreeIncidentDetailDto
            {
                Id = i.Id,
                TreeId = i.TreeId,
                TreeName = i.Tree.Name,
                Description = i.Content,
                Status = i.Status,
                ReportedDate = i.ReportedDate ?? DateTime.UtcNow,
                ReportedBy = i.ReporterName ?? i.ReporterId,
                Images = i.Images.Select(img => img.Path!).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (incident is null)
            throw new KeyNotFoundException($"TreeIncident {request.Id} not found.");

        return incident;
    }
}
