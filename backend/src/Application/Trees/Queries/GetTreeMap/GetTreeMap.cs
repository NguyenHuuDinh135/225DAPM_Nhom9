using backend.Application.Common.Interfaces;
using backend.Application.Trees.Queries.GetTreeMap;

namespace backend.Application.Trees.Queries.GetTreeMap;

public record GetTreeMapQuery : IRequest<TreeMapVm>
{
}

public class GetTreeMapQueryValidator : AbstractValidator<GetTreeMapQuery>
{
    public GetTreeMapQueryValidator()
    {
    }
}

public class GetTreeMapQueryHandler : IRequestHandler<GetTreeMapQuery, TreeMapVm>
{
    private readonly IApplicationDbContext _context;

    public GetTreeMapQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeMapVm> Handle(GetTreeMapQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
