using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Commands.RelocateTree;

public record RelocateTreeCommand(int Id, double Latitude, double Longitude) : IRequest<Result>;

public class RelocateTreeCommandHandler(IApplicationDbContext context)
    : IRequestHandler<RelocateTreeCommand, Result>
{
    public async Task<Result> Handle(RelocateTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await context.Trees.FindAsync([request.Id], cancellationToken);
        if (tree is null) return Result.Failure("Tree not found.");

        var current = await context.TreeLocationHistories
            .Where(h => h.TreeId == request.Id && h.ToDate == null)
            .FirstOrDefaultAsync(cancellationToken);
        if (current is not null) current.ToDate = DateTime.UtcNow;

        tree.Relocate(request.Latitude, request.Longitude);
        await context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
