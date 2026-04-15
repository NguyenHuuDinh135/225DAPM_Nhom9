using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.UpdatePlan;

public record UpdatePlanCommand : IRequest<IStatusResult>
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Status { get; init; }
}

public class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdatePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return StatusResult.Failure($"Plan {request.Id} not found.");

        plan.Name = request.Name ?? plan.Name;
        plan.StartDate = request.StartDate ?? plan.StartDate;
        plan.EndDate = request.EndDate ?? plan.EndDate;
        plan.Status = request.Status ?? plan.Status;

        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
