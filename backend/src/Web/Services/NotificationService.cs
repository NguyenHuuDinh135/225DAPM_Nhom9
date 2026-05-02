using backend.Application.Common.Interfaces;
using backend.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace backend.Web.Services;

public class NotificationService(IHubContext<IncidentHub> hubContext, ILogger<NotificationService> logger) : INotificationService
{
    public async Task SendIncidentNotificationAsync(string message, int incidentId)
    {
        try
        {
            await hubContext.Clients.All.SendAsync("ReceiveIncidentNotification", message, incidentId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending incident notification for incident {IncidentId}", incidentId);
        }
    }

    public async Task SendNotificationAsync(string title, string message, string type = "info")
    {
        try
        {
            await hubContext.Clients.All.SendAsync("ReceiveNotification", title, message, type);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error sending notification: {Title}", title);
        }
    }
}
