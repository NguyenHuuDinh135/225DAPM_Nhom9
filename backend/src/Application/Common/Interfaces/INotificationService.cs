namespace backend.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendIncidentNotificationAsync(string message, Guid incidentId);
}
