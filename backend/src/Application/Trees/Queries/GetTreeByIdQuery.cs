using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Trees.Queries;

public record GetTreeByIdQuery(int Id) : IRequest<TreeDto?>;

public class GetTreeByIdQueryHandler : IRequestHandler<GetTreeByIdQuery, TreeDto?>
{
    private readonly IApplicationDbContext _context;
    public GetTreeByIdQueryHandler(IApplicationDbContext context) => _context = context;
    public async Task<TreeDto?> Handle(GetTreeByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _context.Trees.Include(x => x.TreeType).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (t == null) return null;
        return new TreeDto
        {
            Id = t.Id,
            Name = t.Name,
            Condition = t.Condition,
            Height = t.Height,
            TrunkDiameter = t.TrunkDiameter,
            RecordedDate = t.RecordedDate,
            TreeTypeId = t.TreeTypeId,
            TreeTypeName = t.TreeType.Name
        };
    }
}
