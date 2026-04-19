using backend.Application.TreeIncidents.Commands.CreateTreeIncident;
using backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class TreeIncidents : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder app)
    {
        app.MapPost("report-incident", CreateTreeIncident);
        app.MapPut("{id}/status", UpdateIncidentStatus);
    }

    public async Task<int> CreateTreeIncident(ISender sender, [FromBody] CreateTreeIncidentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> UpdateIncidentStatus(ISender sender, int id, [FromBody] UpdateTreeIncidentStatusCommand command)
    {
        if (id != command.Id) return Results.BadRequest();
        await sender.Send(command);
        return Results.NoContent();
    }
}
