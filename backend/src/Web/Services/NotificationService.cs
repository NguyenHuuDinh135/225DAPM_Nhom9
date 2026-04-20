using backend.Application.Common.Interfaces;
using backend.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Web.Services;

public class NotificationService(IHubContext<IncidentHub> hubContext) : INotificationService
{
    public Task SendIncidentNotificationAsync(string message, int incidentId) =>
        hubContext.Clients.All.SendAsync("ReceiveIncidentNotification", message, incidentId);
}
