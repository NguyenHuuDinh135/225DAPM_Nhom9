using backend.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Trees.Commands;

public record DeleteTreeCommand(int Id) : IRequest<bool>;

public class DeleteTreeCommandHandler : IRequestHandler<DeleteTreeCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteTreeCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task<bool> Handle(DeleteTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (tree == null) return false;
        _context.Trees.Remove(tree);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
