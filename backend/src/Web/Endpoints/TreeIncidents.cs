using backend.Application.TreeIncidents.Commands.ApproveIncident;
using backend.Application.TreeIncidents.Commands.CreateIncident;
using backend.Application.TreeIncidents.Commands.ReportIncident;
using backend.Application.TreeIncidents.Commands.SendIncidentFeedback;
using backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;
using backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;
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
        app.MapPost("", CreateIncident).AllowAnonymous();
        app.MapPost("report-incident", ReportIncident).AllowAnonymous().DisableAntiforgery();
        app.MapGet("", GetIncidents).AllowAnonymous(); // Mở công khai cho bản đồ
        app.MapGet("{id}", GetTreeIncidentDetail).AllowAnonymous(); // Mở công khai để xem chi tiết sự cố
        app.MapPut("{id}/status", UpdateIncidentStatus).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong},{Roles.NhanVien}" });
        app.MapPut("{id}/approve", ApproveIncident).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        app.MapPost("{id}/feedback", SendFeedback).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong},{Roles.NhanVien}" });
        app.MapGet("by-location/{locationId:int}", GetIncidentsByLocation).AllowAnonymous();
    }

    public async Task<IResult> CreateIncident(ISender sender, [FromBody] CreateIncidentCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result.Value) : Results.BadRequest(result.Errors);
    }

    public async Task<IResult> ReportIncident(ISender sender, [FromForm] ReportIncidentCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? Results.Ok(result.Value) : Results.BadRequest(result.Errors);
    }

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

    public async Task<List<TreeIncidentDto>> GetIncidentsByLocation(ISender sender, int locationId)
        => await sender.Send(new GetIncidentsByLocationQuery { LocationId = locationId });
}
