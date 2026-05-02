using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.SubmitPlan;

public record SubmitPlanCommand(int Id) : IRequest<Result>;

public class SubmitPlanCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    : IRequestHandler<SubmitPlanCommand, Result>
{
    public async Task<Result> Handle(SubmitPlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null) return Result.Failure("Không tìm thấy kế hoạch.");

        try
        {
            plan.SubmitForApproval();
            await context.SaveChangesAsync(cancellationToken);

            await notificationService.SendNotificationAsync(
                "Kế hoạch mới chờ duyệt",
                $"Kế hoạch '{plan.Name}' đã được gửi duyệt.",
                "warning"
            );

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
