using backend.Application.Common.Interfaces;
using backend.Domain.Events;
using MediatR;

namespace backend.Application.EventHandlers;

public class PlanApprovedEventHandler(INotificationService notificationService) : INotificationHandler<PlanApprovedEvent>
{
    public async Task Handle(PlanApprovedEvent notification, CancellationToken cancellationToken)
    {
        await notificationService.SendNotificationAsync(
            "Kế hoạch đã được duyệt",
            $"Kế hoạch '{notification.Plan.Name}' đã được phê duyệt.",
            "success");
    }
}
