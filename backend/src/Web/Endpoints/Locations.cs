using backend.Application.Locations.Commands.CreateLocation;
using backend.Application.Locations.Queries.GetLocations;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Locations : EndpointGroupBase
{
    public override string? GroupName => "locations";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetLocations).RequireAuthorization();
        groupBuilder.MapPost(CreateLocation).RequireAuthorization(Roles.Manager, Roles.Admin);
    }

    public async Task<Ok<LocationsVm>> GetLocations(ISender sender)
    {
        var vm = await sender.Send(new GetLocationsQuery());

        return TypedResults.Ok(vm);
    }

    public async Task<Created<int>> CreateLocation(ISender sender, CreateLocationCommand command)
    {
        var id = await sender.Send(command);

        return TypedResults.Created($"/{nameof(Locations)}/{id}", id);
    }
}
