using backend.Application.TreeIncidents.Commands.ApproveIncident;
using backend.Application.TreeIncidents.Commands.CreateIncident;
using backend.Application.TreeIncidents.Commands.CreateTreeIncident;
using backend.Application.TreeIncidents.Commands.SendIncidentFeedback;
using backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;
using backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;
using backend.Application.TreeIncidents.Queries.GetTreeIncidents;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class TreeIncidents : EndpointGroupBase
{
    public override string? GroupName => "tree-incidents";

    public override void Map(RouteGroupBuilder app)
    {
        // Temporary: Disable authorization for testing
        app.MapPost("", CreateIncident).AllowAnonymous();
        app.MapPost("report-incident", CreateTreeIncident).AllowAnonymous().DisableAntiforgery();
<<<<<<< HEAD
        app.MapGet("", GetIncidents).AllowAnonymous();
        app.MapGet("{id}", GetTreeIncidentDetail).AllowAnonymous();
        app.MapPut("{id}/status", UpdateIncidentStatus).AllowAnonymous();
        app.MapPut("{id}/approve", ApproveIncident).AllowAnonymous();
        app.MapPost("{id}/feedback", SendFeedback).AllowAnonymous();
=======
        app.MapGet("", GetIncidents).RequireAuthorization();
        app.MapGet("{id}", GetTreeIncidentDetail).RequireAuthorization();
        app.MapPut("{id}/status", UpdateIncidentStatus).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.Manager},{Roles.Employee},{Roles.Administrator}" });
        app.MapPut("{id}/approve", ApproveIncident).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.Manager},{Roles.Administrator}" });
        app.MapPost("{id}/feedback", SendFeedback).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.Manager},{Roles.Employee},{Roles.Administrator}" });
>>>>>>> bad814c0a4bc39e490ebbf32052bc69716786855
    }

    public async Task<int> CreateIncident(ISender sender, [FromBody] CreateIncidentCommand command)
        => await sender.Send(command);

    public async Task<int> CreateTreeIncident(ISender sender, [FromForm] CreateTreeIncidentCommand command)
        => await sender.Send(command);

    public async Task<IResult> SendFeedback(ISender sender, int id, [FromBody] SendIncidentFeedbackCommand command)
    {
        var result = await sender.Send(command with { IncidentId = id });
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

    public async Task<IResult> ApproveIncident(ISender sender, int id, [FromBody] ApproveIncidentCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? Results.NoContent() : Results.BadRequest(result.Errors);
    }
}
