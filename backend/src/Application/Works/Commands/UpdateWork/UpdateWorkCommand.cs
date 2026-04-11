using backend.Domain.Enums;

namespace backend.Application.Works.Commands.UpdateWork;

public record UpdateWorkCommand : IRequest<IStatusResult>
{
    public int Id { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public WorkStatus Status { get; init; }
}

public class UpdateWorkCommandValidator : AbstractValidator<UpdateWorkCommand>
{
    public UpdateWorkCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public class UpdateWorkCommandHandler : IRequestHandler<UpdateWorkCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateWorkCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.Id], cancellationToken);

        if (work is null)
            return StatusResult.Failure($"Work {request.Id} not found.");

        work.StartDate = request.StartDate;
        work.EndDate = request.EndDate;
        work.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);

        return StatusResult.Success();
    }
}
