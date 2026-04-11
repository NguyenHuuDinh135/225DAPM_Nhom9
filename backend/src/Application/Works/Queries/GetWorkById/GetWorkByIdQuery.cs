using backend.Application.Works.Queries.GetWorks;

namespace backend.Application.Works.Queries.GetWorkById;

public record GetWorkByIdQuery(int Id) : IRequest<WorkDto?>;

public class GetWorkByIdQueryHandler : IRequestHandler<GetWorkByIdQuery, WorkDto?>
{
    private readonly IApplicationDbContext _context;

    public GetWorkByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkDto?> Handle(GetWorkByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Works
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .Where(w => w.Id == request.Id)
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
            .FirstOrDefaultAsync(cancellationToken);
    }
}
