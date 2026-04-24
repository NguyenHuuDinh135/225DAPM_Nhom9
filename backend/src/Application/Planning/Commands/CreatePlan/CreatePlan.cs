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
        // Convert DateTime to UTC if not null
        var startDate = request.StartDate.HasValue 
            ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) 
            : (DateTime?)null;
        var endDate = request.EndDate.HasValue 
            ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) 
            : (DateTime?)null;

        var plan = Plan.Create(request.Name!, request.CreatorId, startDate, endDate);

        _context.Plans.Add(plan);
        await _context.SaveChangesAsync(cancellationToken);
        return plan.Id;
    }
}
