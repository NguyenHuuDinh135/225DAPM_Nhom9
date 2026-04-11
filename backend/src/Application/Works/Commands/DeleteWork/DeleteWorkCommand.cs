namespace backend.Application.Works.Commands.DeleteWork;

public record DeleteWorkCommand(int Id) : IRequest<IStatusResult>;

public class DeleteWorkCommandHandler : IRequestHandler<DeleteWorkCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public DeleteWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(DeleteWorkCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.Id], cancellationToken);

        if (work is null)
            return StatusResult.Failure($"Work {request.Id} not found.");

        _context.Works.Remove(work);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusResult.Success();
    }
}
