using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;

namespace backend.Application.Trees.Commands;

public record CreateTreeCommand(string? Name, string? Condition, decimal? Height, decimal? TrunkDiameter, DateTime? RecordedDate, int TreeTypeId) : IRequest<int>;

public class CreateTreeCommandHandler : IRequestHandler<CreateTreeCommand, int>
{
    private readonly IApplicationDbContext _context;
    public CreateTreeCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task<int> Handle(CreateTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = new Tree
        {
            Name = request.Name,
            Condition = request.Condition,
            Height = request.Height,
            TrunkDiameter = request.TrunkDiameter,
            RecordedDate = request.RecordedDate ?? DateTime.UtcNow,
            TreeTypeId = request.TreeTypeId
        };
        _context.Trees.Add(tree);
        await _context.SaveChangesAsync(cancellationToken);
        return tree.Id;
    }
}
