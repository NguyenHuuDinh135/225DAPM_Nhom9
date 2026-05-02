using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.RejectPlan;

public record RejectPlanCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public class RejectPlanCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    : IRequestHandler<RejectPlanCommand, Result>
{
    public async Task<Result> Handle(RejectPlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null) return Result.Failure("Không tìm thấy kế hoạch.");

        try
        {
            plan.Reject(request.Reason);
            await context.SaveChangesAsync(cancellationToken);

            await notificationService.SendNotificationAsync(
                "Kế hoạch bị từ chối",
                $"Kế hoạch '{plan.Name}' đã bị từ chối. Lý do: {request.Reason}",
                "error"
            );

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
