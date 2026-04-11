using backend.Application.WorkItems.Commands.AssignWork;
using backend.Application.WorkItems.Commands.DeleteWorkItem;
using backend.Application.WorkItems.Commands.UpdateWorkItem;
using backend.Application.WorkItems.Queries.GetWorkItems;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class WorkItems : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetWorkItems).RequireAuthorization();
        groupBuilder.MapPost(CreateWorkItem).RequireAuthorization();
        groupBuilder.MapPut(UpdateWorkItem, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteWorkItem, "{id}").RequireAuthorization();
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
}
