namespace backend.Application.WorkItems.Queries.GetWorkItems;

public record GetWorkItemsQuery : IRequest<WorkItemsVm>;

public class GetWorkItemsQueryHandler : IRequestHandler<GetWorkItemsQuery, WorkItemsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IIdentityService _identityService;

    public GetWorkItemsQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    {
        _context = context;
        _identityService = identityService;
    }

    public async Task<WorkItemsVm> Handle(GetWorkItemsQuery request, CancellationToken cancellationToken)
    {
        var items = await _context.Works
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .Include(w => w.WorkUsers)
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
                AssignedUsers = w.WorkUsers.Select(wu => new WorkUserDto {
                    UserId = wu.UserId,
                    Role = wu.Role
                }).ToList(),
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

        // Populate UserNames from IdentityService
        var users = await _identityService.GetUsersAsync();
        var userDict = users.ToDictionary(u => u.Id, u => u.UserName);

        foreach (var item in items)
        {
            foreach (var user in item.AssignedUsers)
            {
                if (user.UserId != null && userDict.TryGetValue(user.UserId, out var userName))
                {
                    user.UserName = userName;
                }
            }
        }

        return new WorkItemsVm { WorkItems = items };
    }
}
