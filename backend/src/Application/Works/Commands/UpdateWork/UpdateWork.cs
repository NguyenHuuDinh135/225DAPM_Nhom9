using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.Works.Commands.UpdateWork;

public record UpdateWorkCommand : IRequest<Unit>
{
    public int Id { get; init; }
    public int WorkTypeId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public WorkStatus Status { get; init; }
}

public class UpdateWorkCommandValidator : AbstractValidator<UpdateWorkCommand>
{
    public UpdateWorkCommandValidator()
    {
        RuleFor(v => v.Id).GreaterThan(0);
        RuleFor(v => v.WorkTypeId).GreaterThan(0);
    }
}

public class UpdateWorkCommandHandler : IRequestHandler<UpdateWorkCommand, Unit>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateWorkCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Works.FindAsync([request.Id], cancellationToken)
            ?? throw new KeyNotFoundException($"Work {request.Id} not found.");

        entity.Update(
            workTypeId: request.WorkTypeId,
            startDate: request.StartDate,
            endDate: request.EndDate,
            status: request.Status
        );

        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
