namespace backend.Application.Works.Queries.GetWorks;

public record GetWorksQuery : IRequest<List<WorkDto>>;

public class GetWorksQueryHandler : IRequestHandler<GetWorksQuery, List<WorkDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWorksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkDto>> Handle(GetWorksQuery request, CancellationToken cancellationToken)
    {
        return await _context.Works
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .Select(w => new WorkDto
            {
                Id = w.Id,
                WorkTypeId = w.WorkTypeId,
                WorkTypeName = w.WorkType.Name,
                PlanId = w.PlanId,
                PlanName = w.Plan.Name,
                CreatorId = w.CreatorId,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                Status = w.Status
            })
            .ToListAsync(cancellationToken);
    }
}
