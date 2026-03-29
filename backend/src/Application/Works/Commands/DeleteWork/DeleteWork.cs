using backend.Application.Common.Interfaces;

namespace backend.Application.Works.Commands.DeleteWork;

public record DeleteWorkCommand(int Id) : IRequest<Unit>;

public class DeleteWorkCommandValidator : AbstractValidator<DeleteWorkCommand>
{
    public DeleteWorkCommandValidator()
    {
        RuleFor(v => v.Id).GreaterThan(0);
    }
}

public class DeleteWorkCommandHandler : IRequestHandler<DeleteWorkCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeleteWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeleteWorkCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Works.FindAsync([request.Id], cancellationToken)
            ?? throw new KeyNotFoundException($"Work {request.Id} not found.");

        _context.Works.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
