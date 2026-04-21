using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Queries.GetTrees;

public record GetTreesQuery : IRequest<IEnumerable<TreeDto>>;

public class GetTreesQueryHandler : IRequestHandler<GetTreesQuery, IEnumerable<TreeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTreesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<IEnumerable<TreeDto>> Handle(GetTreesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Trees
            .AsNoTracking()
            .Include(t => t.TreeType)
            .Select(t => new TreeDto
            {
                Id = t.Id,
                Name = t.Name,
                Condition = t.Condition,
                TreeTypeId = t.TreeTypeId,
                TreeTypeName = t.TreeType.Name,
                LastMaintenanceDate = t.LastMaintenanceDate
            })
            .ToListAsync(cancellationToken);
    }
}
