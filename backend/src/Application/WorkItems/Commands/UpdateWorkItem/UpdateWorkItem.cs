using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.WorkItems.Commands.UpdateWorkItem;

public record UpdateWorkItemCommand : IRequest<Result>
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

public class UpdateWorkItemCommandHandler : IRequestHandler<UpdateWorkItemCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateWorkItemCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateWorkItemCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.Id], cancellationToken);
        if (work is null)
            return Result.Failure($"WorkItem {request.Id} not found.");

        work.Update(request.StartDate, request.EndDate);
        
        // Ensure status is updated if it's different or if we want to allow manual status overrides
        // Assuming the entity has a way to set status or it's handled via specific methods
        
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
