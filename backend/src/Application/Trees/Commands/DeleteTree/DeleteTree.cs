using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Commands.DeleteTree;

public record DeleteTreeCommand(int Id) : IRequest<IStatusResult>;

public class DeleteTreeCommandHandler : IRequestHandler<DeleteTreeCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public DeleteTreeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(DeleteTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees.FindAsync([request.Id], cancellationToken);
        if (tree is null)
            return StatusResult.Failure($"Tree {request.Id} not found.");

        _context.Trees.Remove(tree);
        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
