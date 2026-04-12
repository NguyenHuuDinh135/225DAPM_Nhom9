using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.DeletePlan;

public record DeletePlanCommand(int Id) : IRequest<IStatusResult>;

public class DeletePlanCommandHandler : IRequestHandler<DeletePlanCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public DeletePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return StatusResult.Failure($"Plan {request.Id} not found.");

        _context.Plans.Remove(plan);
        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
