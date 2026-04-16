using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Trees.Commands;

public record UpdateTreeCommand(int Id, string? Name, string? Condition, decimal? Height, decimal? TrunkDiameter, int TreeTypeId) : IRequest<bool>;

public class UpdateTreeCommandHandler : IRequestHandler<UpdateTreeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public UpdateTreeCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task<bool> Handle(UpdateTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (tree == null) return false;
        tree.Name = request.Name ?? tree.Name;
        tree.Condition = request.Condition ?? tree.Condition;
        tree.Height = request.Height ?? tree.Height;
        tree.TrunkDiameter = request.TrunkDiameter ?? tree.TrunkDiameter;
        tree.TreeTypeId = request.TreeTypeId;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
