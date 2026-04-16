using backend.Application.Trees.Commands;
using backend.Application.Trees.Queries;
using MediatR;
namespace backend.Web.Endpoints;

public static class TreesEndpoints
{
    public static IEndpointRouteBuilder MapTreesEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/trees").WithTags("Trees");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTreesQuery());
            return Results.Ok(result);
        });

        group.MapGet("/{id:int}", async (int id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTreeByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        });

        group.MapPost("/", async (CreateTreeCommand command, IMediator mediator) =>
        {
            var id = await mediator.Send(command);
            return Results.Created($"/api/trees/{id}", id);
        });

        group.MapPut("/{id:int}", async (int id, UpdateTreeCommand command, IMediator mediator) =>
        {
            if (id != command.Id) return Results.BadRequest();
            var success = await mediator.Send(command);
            return success ? Results.NoContent() : Results.NotFound();
        });

        group.MapDelete("/{id:int}", async (int id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteTreeCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        });

        return routes;
    }
}
