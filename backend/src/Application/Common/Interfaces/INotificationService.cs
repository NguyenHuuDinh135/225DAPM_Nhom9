namespace backend.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendIncidentNotificationAsync(string message, int incidentId);
    Task SendNotificationAsync(string title, string message, string type = "info");
}
