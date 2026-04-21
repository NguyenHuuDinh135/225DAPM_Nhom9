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
            .Include(w => w.WorkDetails)
                .ThenInclude(wd => wd.Tree)
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
                Status = w.Status,
                TreeLocations = w.WorkDetails
                    .Where(wd => wd.Tree.Latitude != null && wd.Tree.Longitude != null)
                    .Select(wd => new WorkTreeLocationDto
                    {
                        TreeId = wd.TreeId,
                        TreeName = wd.Tree.Name,
                        Latitude = wd.Tree.Latitude,
                        Longitude = wd.Tree.Longitude,
                    }).ToList()
            })
            .ToListAsync(cancellationToken);

        return new WorkItemsVm { WorkItems = items };
    }
}
