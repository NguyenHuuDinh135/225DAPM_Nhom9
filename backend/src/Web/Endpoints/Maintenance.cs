using backend.Application.Maintenance.Commands.RunMaintenance;
using backend.Application.Common.Models;
using backend.Web.Infrastructure;
using MediatR;
using backend.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Maintenance : EndpointGroupBase
{
    public override string? GroupName => "maintenance";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost("/trigger", TriggerMaintenance).RequireAuthorization();
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> TriggerMaintenance(ISender sender, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new RunMaintenanceCommand(), cancellationToken);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
