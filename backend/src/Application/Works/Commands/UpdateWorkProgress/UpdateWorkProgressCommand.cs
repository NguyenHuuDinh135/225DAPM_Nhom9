using backend.Domain.Entities;

namespace backend.Application.Works.Commands.UpdateWorkProgress;

public record UpdateWorkProgressCommand : IRequest<IStatusResult>
{
    public int WorkId { get; init; }
    public string UpdaterId { get; init; } = string.Empty;
    public int Percentage { get; init; }
    public string? Note { get; init; }
}

public class UpdateWorkProgressCommandValidator : AbstractValidator<UpdateWorkProgressCommand>
{
    public UpdateWorkProgressCommandValidator()
    {
        RuleFor(x => x.WorkId).GreaterThan(0);
        RuleFor(x => x.UpdaterId).NotEmpty();
        RuleFor(x => x.Percentage).InclusiveBetween(0, 100);
    }
}

public class UpdateWorkProgressCommandHandler : IRequestHandler<UpdateWorkProgressCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkProgressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateWorkProgressCommand request, CancellationToken cancellationToken)
    {
        var workExists = await _context.Works.AnyAsync(w => w.Id == request.WorkId, cancellationToken);
        if (!workExists)
            return StatusResult.Failure($"Work {request.WorkId} not found.");

        var progress = new WorkProgress
        {
            WorkId = request.WorkId,
            UpdaterId = request.UpdaterId,
            Percentage = request.Percentage,
            Note = request.Note,
            UpdatedDate = DateTime.UtcNow
        };

        _context.WorkProgresses.Add(progress);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusResult.Success();
    }
}
