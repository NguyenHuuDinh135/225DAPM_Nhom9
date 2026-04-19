using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using MediatR;

namespace backend.Application.Maintenance.Commands.RunMaintenance;

public record RunMaintenanceCommand : IRequest<IStatusResult>;

public class RunMaintenanceCommandHandler : IRequestHandler<RunMaintenanceCommand, IStatusResult>
{
    private readonly IMaintenanceJobService _maintenanceJobService;

    public RunMaintenanceCommandHandler(IMaintenanceJobService maintenanceJobService)
    {
        _maintenanceJobService = maintenanceJobService;
    }

    public async Task<IStatusResult> Handle(RunMaintenanceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _maintenanceJobService.CheckAndGenerateMaintenanceWorkAsync(cancellationToken);
            return StatusResult.Success();
        }
        catch (Exception ex)
        {
            return StatusResult.Failure(ex.Message);
        }
    }
}
