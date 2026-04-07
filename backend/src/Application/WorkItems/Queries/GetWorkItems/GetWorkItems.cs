using backend.Application.Common.Interfaces;

namespace backend.Application.WorkItems.Queries.GetWorkItems;

public record GetWorkItemsQuery : IRequest<WorkItemsVm>
{
}

public class GetWorkItemsQueryValidator : AbstractValidator<GetWorkItemsQuery>
{
    public GetWorkItemsQueryValidator()
    {
    }
}

public class GetWorkItemsQueryHandler : IRequestHandler<GetWorkItemsQuery, WorkItemsVm>
{
    private readonly IApplicationDbContext _context;

    public GetWorkItemsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkItemsVm> Handle(GetWorkItemsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
