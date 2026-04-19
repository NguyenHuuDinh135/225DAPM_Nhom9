namespace backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

public record GetIncidentsByLocationQuery : IRequest<List<TreeIncidentDto>>
{
    public int LocationId { get; init; }
}

public class GetIncidentsByLocationQueryHandler : IRequestHandler<GetIncidentsByLocationQuery, List<TreeIncidentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetIncidentsByLocationQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<TreeIncidentDto>> Handle(GetIncidentsByLocationQuery request, CancellationToken cancellationToken)
    {
        var incidents = await _context.TreeIncidents
            .Include(i => i.Images)
            .Include(i => i.Tree)
            .Where(i => i.Status != "Resolved")
            .ToListAsync(cancellationToken);

        return incidents.Select(i => _mapper.Map<TreeIncidentDto>(i)).ToList();
    }
}
