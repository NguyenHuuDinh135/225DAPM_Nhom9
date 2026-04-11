using backend.Application.Works.Commands.AssignUserToWork;
using backend.Application.Works.Commands.CreateWork;
using backend.Application.Works.Commands.DeleteWork;
using backend.Application.Works.Commands.UpdateWork;
using backend.Application.Works.Commands.UpdateWorkProgress;
using backend.Application.Works.Queries.GetWorkById;
using backend.Application.Works.Queries.GetWorks;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Works : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetWorks).RequireAuthorization();
        groupBuilder.MapGet(GetWorkById, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreateWork).RequireAuthorization();
        groupBuilder.MapPut(UpdateWork, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteWork, "{id}").RequireAuthorization();
        groupBuilder.MapPost(AssignUser, "{id}/assign").RequireAuthorization();
        groupBuilder.MapPost(UpdateProgress, "{id}/progress").RequireAuthorization();
    }

    public async Task<Ok<List<WorkDto>>> GetWorks(ISender sender)
    {
        var result = await sender.Send(new GetWorksQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Results<Ok<WorkDto>, NotFound>> GetWorkById(ISender sender, int id)
    {
        var result = await sender.Send(new GetWorkByIdQuery(id));
        return result is null ? TypedResults.NotFound() : TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreateWork(ISender sender, CreateWorkCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/Works/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateWork(ISender sender, int id, UpdateWorkCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest(new[] { "Id mismatch" });

        var result = await sender.Send(command);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeleteWork(ISender sender, int id)
    {
        var result = await sender.Send(new DeleteWorkCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> AssignUser(ISender sender, int id, AssignUserToWorkCommand command)
    {
        var cmd = command with { WorkId = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateProgress(ISender sender, int id, UpdateWorkProgressCommand command)
    {
        var cmd = command with { WorkId = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
