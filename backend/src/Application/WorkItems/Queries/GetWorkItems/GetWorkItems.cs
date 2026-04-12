namespace backend.Application.WorkItems.Queries.GetWorkItems;

public record GetWorkItemsQuery : IRequest<WorkItemsVm>;

public class GetWorkItemsQueryHandler : IRequestHandler<GetWorkItemsQuery, WorkItemsVm>
{
    private readonly IApplicationDbContext _context;

    public GetWorkItemsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkItemsVm> Handle(GetWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Works
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .Select(w => new WorkItemDto
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

        return new WorkItemsVm { WorkItems = items };
    }
}
