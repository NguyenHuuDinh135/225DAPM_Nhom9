using backend.Application.Locations.Commands.CreateLocation;
using backend.Application.Locations.Commands.DeleteLocation;
using backend.Application.Locations.Commands.UpdateLocation;
using backend.Application.Locations.Queries.GetLocationById;
using backend.Application.Locations.Queries.GetLocations;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Locations : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetLocations).RequireAuthorization();
        groupBuilder.MapGet(GetLocationById, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreateLocation).RequireAuthorization();
        groupBuilder.MapPut(UpdateLocation, "{id}").RequireAuthorization();
        groupBuilder.MapDelete(DeleteLocation, "{id}").RequireAuthorization();
    }

    public async Task<Ok<LocationsVm>> GetLocations(ISender sender)
    {
        var vm = await sender.Send(new GetLocationsQuery());

        return TypedResults.Ok(vm);
    }

    public async Task<Ok<LocationDto>> GetLocationById(ISender sender, int id)
    {
        var location = await sender.Send(new GetLocationByIdQuery(id));

        return TypedResults.Ok(location);
    }

    public async Task<Created<int>> CreateLocation(ISender sender, CreateLocationCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/api/{nameof(Locations)}/{id}", id);
    }

    public async Task<NoContent> UpdateLocation(ISender sender, int id, UpdateLocationCommand command)
    {
        var cmd = command with { Id = id };

        await sender.Send(cmd);

        return TypedResults.NoContent();
    }

    public async Task<NoContent> DeleteLocation(ISender sender, int id)
    {
        await sender.Send(new DeleteLocationCommand(id));

        return TypedResults.NoContent();
    }
}
