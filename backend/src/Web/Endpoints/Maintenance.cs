using backend.Application.Maintenance.Commands.RunMaintenance;
using backend.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Maintenance : EndpointGroupBase
{
    public override string? GroupName => "maintenance";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Temporary: Disable authorization for testing
        groupBuilder.MapPost("/trigger", TriggerMaintenance).AllowAnonymous();
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> TriggerMaintenance(ISender sender, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RunMaintenanceCommand(), cancellationToken);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
