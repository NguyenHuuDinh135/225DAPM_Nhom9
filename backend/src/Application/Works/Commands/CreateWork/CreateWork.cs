using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.Works.Commands.CreateWork;

public record CreateWorkCommand : IRequest<int>
{
    public int WorkTypeId { get; init; }
    public int PlanId { get; init; }
    public string CreatorId { get; init; } = null!;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class CreateWorkCommandValidator : AbstractValidator<CreateWorkCommand>
{
    public CreateWorkCommandValidator()
    {
        RuleFor(v => v.WorkTypeId).GreaterThan(0);
        RuleFor(v => v.PlanId).GreaterThan(0);
        RuleFor(v => v.CreatorId).NotEmpty();
    }
}

public class CreateWorkCommandHandler : IRequestHandler<CreateWorkCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateWorkCommand request, CancellationToken cancellationToken)
    {
        var entity = new Work(
            workTypeId: request.WorkTypeId,
            planId: request.PlanId,
            creatorId: request.CreatorId,
            startDate: request.StartDate,
            endDate: request.EndDate
        );

        _context.Works.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
