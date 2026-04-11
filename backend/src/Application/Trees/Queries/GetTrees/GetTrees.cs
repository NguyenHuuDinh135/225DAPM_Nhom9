using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Queries.GetTrees;

public record GetTreesQuery : IRequest<IEnumerable<TreeDto>>
{
}

public class GetTreesQueryValidator : AbstractValidator<GetTreesQuery>
{
    public GetTreesQueryValidator()
    {
    }
}

public class GetTreesQueryHandler : IRequestHandler<GetTreesQuery, IEnumerable<TreeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTreesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TreeDto>> Handle(GetTreesQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
