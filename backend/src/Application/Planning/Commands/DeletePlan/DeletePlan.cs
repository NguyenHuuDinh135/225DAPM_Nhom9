using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.DeletePlan;

public record DeletePlanCommand(int Id) : IRequest<Result>;

public class DeletePlanCommandHandler : IRequestHandler<DeletePlanCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeletePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return Result.Failure($"Plan {request.Id} not found.");

        if (plan.Status != Domain.Enums.PlanStatus.Draft && plan.Status != Domain.Enums.PlanStatus.Cancelled)
            return Result.Failure("Chỉ có thể xóa kế hoạch ở trạng thái Nháp hoặc Đã hủy.");

        _context.Plans.Remove(plan);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
