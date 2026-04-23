using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Queries.GetTreeMap;

public record GetTreeMapQuery : IRequest<TreeMapVm>;

public class GetTreeMapQueryHandler : IRequestHandler<GetTreeMapQuery, TreeMapVm>
{
    private readonly IApplicationDbContext _context;

    public GetTreeMapQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeMapVm> Handle(GetTreeMapQuery request, CancellationToken cancellationToken)
    {
        var trees = await _context.Trees
            .AsNoTracking()
            .Include(t => t.TreeType)
            .Where(t => t.Latitude != null && t.Longitude != null)
            .Select(t => new TreeMapDto
            {
                Id = t.Id,
                Name = t.Name,
                Condition = t.Condition,
                TreeTypeName = t.TreeType != null ? t.TreeType.Name : "Không xác định",
                Latitude = t.Latitude,
                Longitude = t.Longitude
            })
            .ToListAsync(cancellationToken);

        return new TreeMapVm { Trees = trees };
    }
}
