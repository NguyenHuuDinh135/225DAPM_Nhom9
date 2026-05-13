using backend.Application.Common.Interfaces;
using backend.Domain.Events;
using MediatR;

namespace backend.Application.EventHandlers;

public class WorkCompletedEventHandler(INotificationService notificationService) : INotificationHandler<WorkCompletedEvent>
{
    public async Task Handle(WorkCompletedEvent notification, CancellationToken cancellationToken)
    {
        await notificationService.SendNotificationAsync(
            "Công việc hoàn thành",
            $"Công việc #{notification.Work.Id} đã được hoàn thành.",
            "success");
    }
}
