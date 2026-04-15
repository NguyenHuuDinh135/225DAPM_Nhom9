using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.WorkItems.Commands.UpdateWorkItem;

public record UpdateWorkItemCommand : IRequest<IStatusResult>
{
    public int Id { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public WorkStatus Status { get; init; }
}

public class UpdateWorkItemCommandValidator : AbstractValidator<UpdateWorkItemCommand>
{
    public UpdateWorkItemCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public class UpdateWorkItemCommandHandler : IRequestHandler<UpdateWorkItemCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateWorkItemCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.Id], cancellationToken);
        if (work is null)
            return StatusResult.Failure($"WorkItem {request.Id} not found.");

        work.StartDate = request.StartDate;
        work.EndDate = request.EndDate;
        work.Status = request.Status;

        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
