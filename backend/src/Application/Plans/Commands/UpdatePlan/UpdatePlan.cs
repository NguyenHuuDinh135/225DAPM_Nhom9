using backend.Application.Common.Interfaces;

namespace backend.Application.Plans.Commands.UpdatePlan;

public record UpdatePlanCommand : IRequest<Unit>
{
    public int Id { get; init; }
    public string Name { get; init; } = null!;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(v => v.Id).GreaterThan(0);
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.Status).NotEmpty();
    }
}

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdatePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Plans.FindAsync([request.Id], cancellationToken)
            ?? throw new KeyNotFoundException($"Plan {request.Id} not found.");

        entity.Update(
            name: request.Name,
            startDate: request.StartDate,
            endDate: request.EndDate,
            status: request.Status
        );

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
