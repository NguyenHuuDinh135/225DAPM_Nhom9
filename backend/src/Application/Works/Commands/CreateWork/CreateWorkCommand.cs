using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Application.Works.Commands.CreateWork;

public record CreateWorkCommand : IRequest<int>
{
    public int WorkTypeId { get; init; }
    public int PlanId { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public class CreateWorkCommandValidator : AbstractValidator<CreateWorkCommand>
{
    public CreateWorkCommandValidator()
    {
        RuleFor(x => x.WorkTypeId).GreaterThan(0);
        RuleFor(x => x.PlanId).GreaterThan(0);
        RuleFor(x => x.CreatorId).NotEmpty();
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

        return work.Id;
    }
}
