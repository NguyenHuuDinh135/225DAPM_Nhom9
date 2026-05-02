using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.UpdatePlan;

public record UpdatePlanCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class UpdatePlanCommandValidator : AbstractValidator<UpdatePlanCommand>
{
    public UpdatePlanCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public class UpdatePlanCommandHandler : IRequestHandler<UpdatePlanCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdatePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return Result.Failure($"Plan {request.Id} not found.");

        plan.Update(request.Name, request.StartDate, request.EndDate);

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
