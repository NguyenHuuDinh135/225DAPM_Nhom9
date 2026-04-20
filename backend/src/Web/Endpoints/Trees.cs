using backend.Application.Trees.Commands;
using backend.Application.Trees.Commands.DeleteTree;
using backend.Application.Trees.Commands.UpdateTree;
using backend.Application.Trees.Queries.GetTreeDetail;
using backend.Application.Trees.Queries.GetTreeMap;
using backend.Application.Trees.Queries.GetTrees;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Trees : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("", GetAllTrees).RequireAuthorization();
        groupBuilder.MapGet("map", GetTreeMap).RequireAuthorization();
        groupBuilder.MapGet("{id}", GetTreeDetail).RequireAuthorization();
        groupBuilder.MapPost("", CreateTree).RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapPut("{id}", UpdateTree).RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapDelete("{id}", DeleteTree).RequireAuthorization(Roles.Manager, Roles.Admin);
    }

    public async Task<IEnumerable<TreeDto>> GetAllTrees(ISender sender)
        => await sender.Send(new GetTreesQuery());

    public async Task<Ok<TreeMapVm>> GetTreeMap(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetTreeMapQuery()));

    public async Task<TreeDetailDto> GetTreeDetail(ISender sender, int id)
        => await sender.Send(new GetTreeDetailQuery(id));

    public async Task<Results<Created<int>, BadRequest>> CreateTree(ISender sender, CreateTreeCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/Trees/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateTree(ISender sender, int id, UpdateTreeCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeleteTree(ISender sender, int id)
    {
        var result = await sender.Send(new DeleteTreeCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
