using backend.Application.Trees.Commands;
using backend.Application.Trees.Commands.DeleteTree;
using backend.Application.Trees.Commands.ImportTrees;
using backend.Application.Trees.Commands.RelocateTree;
using backend.Application.Trees.Commands.UpdateTree;
using backend.Application.Trees.Queries.GetTreeDetail;
using backend.Application.Trees.Queries.GetTreeLocationHistory;
using backend.Application.Trees.Queries.GetTreeMap;
using backend.Application.Trees.Queries.GetTrees;
using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Constants;
using backend.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace backend.Web.Endpoints;

public class Trees : EndpointGroupBase
{
    public override string? GroupName => "trees";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
<<<<<<< HEAD
        groupBuilder.MapGet("", GetAllTrees).AllowAnonymous();
        groupBuilder.MapGet("map", GetTreeMap).AllowAnonymous();
        groupBuilder.MapGet("{id}", GetTreeDetail).AllowAnonymous();
        groupBuilder.MapGet("{id}/location-history", GetLocationHistory).RequireAuthorization();
        groupBuilder.MapPost("", CreateTree).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPost("import", ImportTrees).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" }).DisableAntiforgery();
        groupBuilder.MapPut("{id}", UpdateTree).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPut("{id}/relocate", RelocateTree).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapDelete("{id}", DeleteTree).RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
=======
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
>>>>>>> main
        groupBuilder.MapPost("seed", SeedTrees).AllowAnonymous();
    }

    public async Task<PaginatedList<TreeDto>> GetAllTrees(
        ISender sender, 
        [FromQuery] int? pageNumber = 1, 
        [FromQuery] int? pageSize = 10, 
        [FromQuery] string? searchTerm = null)
        => await sender.Send(new GetTreesQuery { PageNumber = pageNumber ?? 1, PageSize = pageSize ?? 10, SearchTerm = searchTerm });

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

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateTree(
        ISender sender, 
        int id, 
        UpdateTreeCommand command)
    {
        if (id != command.Id) return TypedResults.BadRequest(new[] { "ID mismatch" });
        var result = await sender.Send(command);
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

    public async Task<IResult> SeedTrees(ApplicationDbContextInitialiser initialiser)
    {
        await initialiser.TrySeedAsync();
        return TypedResults.NoContent();
    }
}
