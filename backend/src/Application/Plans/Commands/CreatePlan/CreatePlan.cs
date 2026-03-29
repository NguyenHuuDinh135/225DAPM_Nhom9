using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Plans.Commands.CreatePlan;

public record CreatePlanCommand : IRequest<int>
{
    public string Name { get; init; } = null!;
    public string CreatorId { get; init; } = null!;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class CreatePlanCommandValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.CreatorId).NotEmpty();
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
        var entity = new Plan(
            name: request.Name,
            creatorId: request.CreatorId,
            startDate: request.StartDate,
            endDate: request.EndDate
        );

        _context.Plans.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
