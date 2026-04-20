using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Queries.GetTreeDetail;

public record GetTreeDetailQuery(int Id) : IRequest<TreeDetailDto>;

public class TreeDetailDto
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Condition { get; init; }
    public string? TreeTypeName { get; init; }
    public decimal? Height { get; init; }
    public decimal? TrunkDiameter { get; init; }
    public DateTime? RecordedDate { get; init; }
    public DateTime? LastMaintenanceDate { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
}

public class GetTreeDetailQueryHandler : IRequestHandler<GetTreeDetailQuery, TreeDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetTreeDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeDetailDto> Handle(GetTreeDetailQuery request, CancellationToken cancellationToken)
    {
        var dto = await _context.Trees
            .AsNoTracking()
            .Include(t => t.TreeType)
            .Where(t => t.Id == request.Id)
            .Select(t => new TreeDetailDto
            {
                Id = t.Id,
                Name = t.Name,
                Condition = t.Condition,
                TreeTypeName = t.TreeType.Name,
                Height = t.Height,
                TrunkDiameter = t.TrunkDiameter,
                RecordedDate = t.RecordedDate,
                LastMaintenanceDate = t.LastMaintenanceDate,
                Latitude = t.Latitude,
                Longitude = t.Longitude
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (dto is null) throw new KeyNotFoundException($"Tree {request.Id} not found.");
        return dto;
    }
}
