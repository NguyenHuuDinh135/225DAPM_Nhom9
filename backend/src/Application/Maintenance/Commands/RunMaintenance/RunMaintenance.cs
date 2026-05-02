using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using MediatR;

namespace backend.Application.Maintenance.Commands.RunMaintenance;

public record RunMaintenanceCommand : IRequest<Result>;

public class RunMaintenanceCommandHandler : IRequestHandler<RunMaintenanceCommand, Result>
{
    private readonly IMaintenanceJobService _maintenanceJobService;

    public RunMaintenanceCommandHandler(IMaintenanceJobService maintenanceJobService)
    {
        _maintenanceJobService = maintenanceJobService;
    }

    public async Task<Result> Handle(RunMaintenanceCommand request, CancellationToken cancellationToken)
    {
        try
        {
            await _maintenanceJobService.CheckAndGenerateMaintenanceWorkAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
