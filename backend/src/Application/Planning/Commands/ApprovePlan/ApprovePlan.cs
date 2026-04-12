using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.ApprovePlan;

public record ApprovePlanCommand : IRequest<IStatusResult>
{
    public int Id { get; init; }
    public string ApproverId { get; init; } = string.Empty;
}

public class ApprovePlanCommandValidator : AbstractValidator<ApprovePlanCommand>
{
    public ApprovePlanCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ApproverId).NotEmpty();
    }
}

public class ApprovePlanCommandHandler : IRequestHandler<ApprovePlanCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public ApprovePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(ApprovePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return StatusResult.Failure($"Plan {request.Id} not found.");

        plan.ApproverId = request.ApproverId;
        plan.Status = "Approved";

        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
