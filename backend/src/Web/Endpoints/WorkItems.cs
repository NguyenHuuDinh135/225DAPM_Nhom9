using backend.Application.WorkItems.Commands.ApproveWorkItem;
using backend.Application.WorkItems.Commands.AssignWork;
using backend.Application.WorkItems.Commands.DeleteWorkItem;
using backend.Application.WorkItems.Commands.ReportWorkProgress;
using backend.Application.WorkItems.Commands.UpdateWorkItem;
using backend.Application.WorkItems.Queries.GetWorkItems;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class WorkItems : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetWorkItems).RequireAuthorization();
        groupBuilder.MapPost(CreateWorkItem).RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapPut(UpdateWorkItem, "{id}").RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapDelete(DeleteWorkItem, "{id}").RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapPost(ReportProgress, "{id}/report-progress").RequireAuthorization(Roles.Employee).DisableAntiforgery();
        groupBuilder.MapPut(ApproveWork, "{id}/approve").RequireAuthorization(Roles.Manager, Roles.Admin);
    }

    public async Task<Ok<WorkItemsVm>> GetWorkItems(ISender sender)
    {
        var result = await sender.Send(new GetWorkItemsQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> CreateWorkItem(ISender sender, AssignWorkCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateWorkItem(ISender sender, int id, UpdateWorkItemCommand command)
    {
        var cmd = command with { Id = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeleteWorkItem(ISender sender, int id)
    {
        var result = await sender.Send(new DeleteWorkItemCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> ReportProgress(
        ISender sender, int id, IFormFileCollection images, [FromForm] string? note, [FromForm] string? updaterId)
    {
        var cmd = new ReportWorkProgressCommand
        {
            WorkItemId = id,
            Images = images.ToList(),
            Note = note,
            UpdaterId = updaterId ?? string.Empty
        };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> ApproveWork(
        ISender sender, int id, ApproveWorkItemCommand command)
    {
        var cmd = command with { WorkItemId = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
