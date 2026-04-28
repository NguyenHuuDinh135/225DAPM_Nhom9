using backend.Application.WorkItems.Commands.ApproveWorkItem;
using backend.Application.WorkItems.Commands.AssignUserToWork;
using backend.Application.WorkItems.Commands.AssignWork;
using backend.Application.WorkItems.Commands.DeleteWorkItem;
using backend.Application.WorkItems.Commands.ReportWorkProgress;
using backend.Application.WorkItems.Commands.UpdateWorkItem;
using backend.Application.WorkItems.Queries.GetWorkItemDetail;
using backend.Application.WorkItems.Queries.GetWorkItems;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class WorkItems : EndpointGroupBase
{
    public override string? GroupName => "work-items";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Temporary: Disable authorization for testing
        groupBuilder.MapGet(GetWorkItems).AllowAnonymous();
        groupBuilder.MapGet(GetWorkItemDetail, "{id}").AllowAnonymous();
        groupBuilder.MapPost(CreateWorkItem).AllowAnonymous();
        groupBuilder.MapPut(UpdateWorkItem, "{id}").AllowAnonymous();
        groupBuilder.MapDelete(DeleteWorkItem, "{id}").AllowAnonymous();
        groupBuilder.MapPost(ReportProgress, "{id}/report-progress").AllowAnonymous().DisableAntiforgery();
        groupBuilder.MapPut(ApproveWork, "{id}/approve").AllowAnonymous();
        groupBuilder.MapPost(AssignUser, "{id}/assign-user").AllowAnonymous();
    }

    public async Task<Ok<WorkItemsVm>> GetWorkItems(ISender sender)
    {
        var result = await sender.Send(new GetWorkItemsQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Ok<WorkItemDetailVm>> GetWorkItemDetail(ISender sender, int id)
        => TypedResults.Ok(await sender.Send(new GetWorkItemDetailQuery(id)));

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

    public async Task<Results<NoContent, BadRequest<string[]>>> AssignUser(ISender sender, int id, AssignUserToWorkCommand command)
    {
        var result = await sender.Send(command with { WorkId = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
