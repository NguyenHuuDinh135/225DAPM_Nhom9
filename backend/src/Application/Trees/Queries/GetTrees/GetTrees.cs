using backend.Application.Common.Interfaces;
using backend.Application.Common.Mappings;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Queries.GetTrees;

public record GetTreesQuery : IRequest<PaginatedList<TreeDto>>
{
    public int? PageNumber { get; init; }
    public int? PageSize { get; init; }
    public string? SearchTerm { get; init; }
}

public class GetTreesQueryHandler : IRequestHandler<GetTreesQuery, PaginatedList<TreeDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTreesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<TreeDto>> Handle(GetTreesQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var query = _context.Trees
                .AsNoTracking()
                .Include(t => t.TreeType)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(t => 
                    (t.Name != null && t.Name.ToLower().Contains(searchTerm)) ||
                    (t.TreeType != null && t.TreeType.Name != null && t.TreeType.Name.ToLower().Contains(searchTerm)) ||
                    t.Id.ToString().Contains(searchTerm));
            }

            return await query
                .OrderByDescending(t => t.Id)
                .Select(t => new TreeDto
                {
                    Id = t.Id,
                    Name = t.Name ?? "Cây chưa đặt tên",
                    Condition = t.Condition ?? "Bình thường",
                    TreeTypeId = t.TreeTypeId,
                    TreeTypeName = t.TreeType != null ? t.TreeType.Name : "Không xác định",
                    LastMaintenanceDate = t.LastMaintenanceDate,
                    Latitude = t.Latitude,
                    Longitude = t.Longitude
                })
                .PaginatedListAsync(request.PageNumber ?? 1, request.PageSize ?? 10, cancellationToken);
        }
        catch (Exception ex)
        {
            // Log error if needed
            throw;
        }
    }
}
