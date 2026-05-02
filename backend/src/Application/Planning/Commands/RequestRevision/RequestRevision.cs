using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.RequestRevision;

public record RequestRevisionCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public class RequestRevisionCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    : IRequestHandler<RequestRevisionCommand, Result>
{
    public async Task<Result> Handle(RequestRevisionCommand request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null) return Result.Failure("Không tìm thấy kế hoạch.");

        try
        {
            plan.RequestRevision(request.Reason);
            await context.SaveChangesAsync(cancellationToken);

            await notificationService.SendNotificationAsync(
                "Yêu cầu chỉnh sửa kế hoạch",
                $"Kế hoạch '{plan.Name}' cần được chỉnh sửa. Lý do: {request.Reason}",
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
