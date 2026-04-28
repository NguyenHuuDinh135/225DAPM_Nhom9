using backend.Application.Trees.Commands;
using backend.Application.Trees.Commands.DeleteTree;
using backend.Application.Trees.Commands.ImportTrees;
using backend.Application.Trees.Commands.RelocateTree;
using backend.Application.Trees.Commands.UpdateTree;
using backend.Application.Trees.Queries.GetTreeDetail;
using backend.Application.Trees.Queries.GetTreeLocationHistory;
using backend.Application.Trees.Queries.GetTreeMap;
using backend.Application.Trees.Queries.GetTrees;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Trees : EndpointGroupBase
{
    public override string? GroupName => "trees";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Temporary: Disable all authorization for testing
        groupBuilder.MapGet("", GetAllTrees).AllowAnonymous();
        groupBuilder.MapGet("map", GetTreeMap).AllowAnonymous();
        groupBuilder.MapGet("{id}", GetTreeDetail).AllowAnonymous();
        groupBuilder.MapGet("{id}/location-history", GetLocationHistory).AllowAnonymous();
        groupBuilder.MapPost("", CreateTree).AllowAnonymous();
        groupBuilder.MapPost("import", ImportTrees).AllowAnonymous().DisableAntiforgery();
        groupBuilder.MapPut("{id}", UpdateTree).AllowAnonymous();
        groupBuilder.MapPut("{id}/relocate", RelocateTree).AllowAnonymous();
        groupBuilder.MapDelete("{id}", DeleteTree).AllowAnonymous();
    }

    public async Task<IEnumerable<TreeDto>> GetAllTrees(ISender sender)
        => await sender.Send(new GetTreesQuery());

    public async Task<Ok<TreeMapVm>> GetTreeMap(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetTreeMapQuery()));

    public async Task<TreeDetailDto> GetTreeDetail(ISender sender, int id)
        => await sender.Send(new GetTreeDetailQuery(id));

    public async Task<Ok<List<TreeLocationHistoryDto>>> GetLocationHistory(ISender sender, int id)
        => TypedResults.Ok(await sender.Send(new GetTreeLocationHistoryQuery(id)));

    public async Task<Results<Created<int>, BadRequest>> CreateTree(ISender sender, CreateTreeCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/Trees/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> ImportTrees(ISender sender, IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var result = await sender.Send(new ImportTreesFromExcelCommand(stream));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateTree(ISender sender, int id, UpdateTreeCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> RelocateTree(ISender sender, int id, RelocateTreeCommand command)
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
