using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.WorkItems.Commands.AssignWork;

public record AssignWorkCommand : IRequest<IStatusResult>
{
    public int WorkTypeId { get; init; }
    public int PlanId { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class AssignWorkCommandValidator : AbstractValidator<AssignWorkCommand>
{
    public AssignWorkCommandValidator()
    {
        RuleFor(x => x.WorkTypeId).GreaterThan(0);
        RuleFor(x => x.PlanId).GreaterThan(0);
        RuleFor(x => x.CreatorId).NotEmpty();
    }
}

public class AssignWorkCommandHandler : IRequestHandler<AssignWorkCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public AssignWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(AssignWorkCommand request, CancellationToken cancellationToken)
    {
        var work = new Work
        {
            WorkTypeId = request.WorkTypeId,
            PlanId = request.PlanId,
            CreatorId = request.CreatorId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CreatedDate = DateTime.UtcNow,
            Status = WorkStatus.New
        };

        _context.Works.Add(work);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusResult.Success();
    }
}
