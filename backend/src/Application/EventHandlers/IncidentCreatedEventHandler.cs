using backend.Application.Common.Interfaces;
using backend.Domain.Events;
using MediatR;

namespace backend.Application.EventHandlers;

public class IncidentCreatedEventHandler(INotificationService notificationService) : INotificationHandler<IncidentCreatedEvent>
{
    public async Task Handle(IncidentCreatedEvent notification, CancellationToken cancellationToken)
    {
        await notificationService.SendNotificationAsync(
            "Sự cố mới được báo cáo",
            $"Sự cố mới tại cây #{notification.Incident.TreeId} đã được ghi nhận.",
            "warning");
    }
}
