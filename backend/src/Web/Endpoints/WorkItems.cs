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
using System.Security.Claims;

namespace backend.Web.Endpoints;

public class WorkItems : EndpointGroupBase
{
    public override string? GroupName => "work-items";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetWorkItems).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong},{Roles.NhanVien}" });
        groupBuilder.MapGet(GetWorkItemDetail, "{id}").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong},{Roles.NhanVien}" });
        groupBuilder.MapPost(CreateWorkItem).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPut(UpdateWorkItem, "{id}").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapDelete(DeleteWorkItem, "{id}").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPost(ReportProgress, "{id}/report-progress").RequireAuthorization(new AuthorizeAttribute { Roles = Roles.NhanVien }).DisableAntiforgery();
        groupBuilder.MapPut(ApproveWork, "{id}/approve").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPost(AssignUser, "{id}/assign-user").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
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
        ClaimsPrincipal principal, ISender sender, int id, IFormFileCollection images, [FromForm] string? note, [FromForm] int? percentage)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var cmd = new ReportWorkProgressCommand
        {
            WorkItemId = id,
            Images = images.ToList(),
            Note = note,
            Percentage = percentage,
            UpdaterId = userId ?? string.Empty
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
