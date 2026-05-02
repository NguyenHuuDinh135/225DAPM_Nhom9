using backend.Application.Lookups.Queries.GetLookups;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Lookups : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder app)
    {
        app.MapGet("tree-types", GetTreeTypes).AllowAnonymous();
        app.MapGet("work-types", GetWorkTypes).AllowAnonymous();
        app.MapGet("wards", GetWards).RequireAuthorization();
        app.MapGet("streets", GetStreets).RequireAuthorization();
    }

    public async Task<Ok<List<TreeTypeLookupDto>>> GetTreeTypes(ISender sender)
    {
        var result = await sender.Send(new GetTreeTypesLookupQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Ok<List<WorkTypeLookupDto>>> GetWorkTypes(ISender sender)
    {
        var result = await sender.Send(new GetWorkTypesLookupQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Ok<List<WardLookupDto>>> GetWards(ISender sender)
    {
        var result = await sender.Send(new GetWardsLookupQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Ok<List<StreetLookupDto>>> GetStreets(ISender sender, int? wardId)
    {
        var result = await sender.Send(new GetStreetsLookupQuery(wardId));
        return TypedResults.Ok(result);
    }
}
