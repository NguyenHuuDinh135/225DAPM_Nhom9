using backend.Application.Common.Interfaces;

namespace backend.Application.Plans.Commands.DeletePlan;

public record DeletePlanCommand(int Id) : IRequest<Unit>;

public class DeletePlanCommandValidator : AbstractValidator<DeletePlanCommand>
{
    public DeletePlanCommandValidator()
    {
        RuleFor(v => v.Id).GreaterThan(0);
    }
}

public class DeletePlanCommandHandler : IRequestHandler<DeletePlanCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public DeletePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Plans.FindAsync([request.Id], cancellationToken)
            ?? throw new KeyNotFoundException($"Plan {request.Id} not found.");

        _context.Plans.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
