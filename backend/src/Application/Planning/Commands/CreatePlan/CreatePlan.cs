using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Planning.Commands.CreatePlan;

public record CreatePlanCommand : IRequest<int>
{
    public string? Name { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class CreatePlanCommandValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.CreatorId).NotEmpty();
    }
}

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreatePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreatePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = Plan.Create(request.Name!, request.CreatorId, request.StartDate, request.EndDate);

        _context.Plans.Add(plan);
        await _context.SaveChangesAsync(cancellationToken);
        return plan.Id;
    }
}
