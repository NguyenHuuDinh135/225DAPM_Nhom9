using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Trees.Queries;

public record GetTreesQuery : IRequest<List<TreeDto>>;

public class TreeDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Condition { get; set; }
    public decimal? Height { get; set; }
    public decimal? TrunkDiameter { get; set; }
    public DateTime? RecordedDate { get; set; }
    public int TreeTypeId { get; set; }
    public string? TreeTypeName { get; set; }
}

public class GetTreesQueryHandler : IRequestHandler<GetTreesQuery, List<TreeDto>>
{
    private readonly IApplicationDbContext _context;
    public GetTreesQueryHandler(IApplicationDbContext context) => _context = context;
    public async Task<List<TreeDto>> Handle(GetTreesQuery request, CancellationToken cancellationToken)
    {
        return await _context.Trees
            .Include(t => t.TreeType)
            .Select(t => new TreeDto
            {
                Id = t.Id,
                Name = t.Name,
                Condition = t.Condition,
                Height = t.Height,
                TrunkDiameter = t.TrunkDiameter,
                RecordedDate = t.RecordedDate,
                TreeTypeId = t.TreeTypeId,
                TreeTypeName = t.TreeType.Name
            })
            .ToListAsync(cancellationToken);
    }
}
