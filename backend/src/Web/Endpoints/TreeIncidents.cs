using backend.Application.TreeIncidents.Commands;
using backend.Application.TreeIncidents.Queries;
using MediatR;

namespace backend.Web.Endpoints;

public static class TreeIncidentsEndpoints
{
    public static IEndpointRouteBuilder MapTreeIncidentsEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/treeincidents").WithTags("TreeIncidents");

        group.MapGet("/", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTreeIncidentsQuery());
            return Results.Ok(result);
        });

        group.MapGet("/{id:int}", async (int id, IMediator mediator) =>
        {
            var result = await mediator.Send(new GetTreeIncidentByIdQuery(id));
            return result is not null ? Results.Ok(result) : Results.NotFound();
        });

        group.MapPost("/", async (CreateTreeIncidentCommand command, IMediator mediator) =>
        {
            var id = await mediator.Send(command);
            return Results.Created($"/api/treeincidents/{id}", id);
        });

        group.MapPut("/{id:int}", async (int id, UpdateTreeIncidentCommand command, IMediator mediator) =>
        {
            if (id != command.Id) return Results.BadRequest();
            var success = await mediator.Send(command);
            return success ? Results.NoContent() : Results.NotFound();
        });

        group.MapDelete("/{id:int}", async (int id, IMediator mediator) =>
        {
            var success = await mediator.Send(new DeleteTreeIncidentCommand(id));
            return success ? Results.NoContent() : Results.NotFound();
        });

        return routes;
    }
}
