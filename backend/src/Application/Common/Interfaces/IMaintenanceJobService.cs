namespace backend.Application.Common.Interfaces;

public interface IMaintenanceJobService
{
    Task CheckAndGenerateMaintenanceWorkAsync(CancellationToken cancellationToken = default);
}
