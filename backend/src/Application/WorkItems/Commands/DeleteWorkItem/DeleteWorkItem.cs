using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.WorkItems.Commands.DeleteWorkItem;

public record DeleteWorkItemCommand(int Id) : IRequest<Result>;

public class DeleteWorkItemCommandHandler : IRequestHandler<DeleteWorkItemCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteWorkItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteWorkItemCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.Id], cancellationToken);
        if (work is null)
            return Result.Failure($"WorkItem {request.Id} not found.");

        _context.Works.Remove(work);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
