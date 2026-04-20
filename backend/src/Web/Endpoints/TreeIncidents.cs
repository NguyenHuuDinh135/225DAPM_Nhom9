using backend.Application.TreeIncidents.Commands.CreateIncident;
using backend.Application.TreeIncidents.Commands.CreateTreeIncident;
using backend.Application.TreeIncidents.Commands.SendIncidentFeedback;
using backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;
using backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;
using backend.Application.TreeIncidents.Queries.GetTreeIncidents;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class TreeIncidents : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder app)
    {
        app.MapPost("", CreateIncident).AllowAnonymous();
        app.MapPost("report-incident", CreateTreeIncident).AllowAnonymous();
        app.MapGet("", GetIncidents).RequireAuthorization();
        app.MapGet("{id}", GetTreeIncidentDetail).RequireAuthorization();
        app.MapPut("{id}/status", UpdateIncidentStatus).RequireAuthorization(Roles.Manager, Roles.Employee);
        app.MapPost("{id}/feedback", SendFeedback).RequireAuthorization(Roles.Manager, Roles.Employee);
    }

    public async Task<int> CreateIncident(ISender sender, [FromBody] CreateIncidentCommand command)
        => await sender.Send(command);

    public async Task<int> CreateTreeIncident(ISender sender, [FromBody] CreateTreeIncidentCommand command)
        => await sender.Send(command);

    public async Task<IResult> SendIncidentFeedback(ISender sender, [FromBody] SendIncidentFeedbackCommand command)
    {
        await sender.Send(command);
        return Results.NoContent();
    }

    public async Task<IResult> SendFeedback(ISender sender, int id, [FromBody] SendIncidentFeedbackCommand command)
    {
        var cmd = command with { IncidentId = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? Results.NoContent() : Results.BadRequest(result.Errors);
    }

    public async Task<TreeIncidentsVm> GetIncidents(ISender sender)
        => await sender.Send(new GetTreeIncidentsQuery());

    public async Task<TreeIncidentDetailDto> GetTreeIncidentDetail(ISender sender, int id)
        => await sender.Send(new GetTreeIncidentDetailQuery { Id = id });

    public async Task<IResult> UpdateIncidentStatus(ISender sender, int id, [FromBody] UpdateTreeIncidentStatusCommand command)
    {
        if (id != command.Id) return Results.BadRequest();
        await sender.Send(command);
        return Results.NoContent();
    }
}
