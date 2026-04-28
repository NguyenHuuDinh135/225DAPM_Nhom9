using backend.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Lookups : EndpointGroupBase
{
    public override string? GroupName => "lookups";

    public override void Map(RouteGroupBuilder app)
    {
        // Temporary: Disable authorization for testing
        app.MapGet("tree-types", GetTreeTypes).AllowAnonymous();
        app.MapGet("work-types", GetWorkTypes).AllowAnonymous();
        app.MapGet("wards", GetWards).AllowAnonymous();
        app.MapGet("streets", GetStreets).AllowAnonymous();
    }

    public async Task<Ok<object>> GetTreeTypes(IApplicationDbContext db)
    {
        var result = await db.TreeTypes.AsNoTracking()
            .Select(t => new { t.Id, t.Name, t.Group })
            .ToListAsync();
        return TypedResults.Ok<object>(result);
    }

    public async Task<Ok<object>> GetWorkTypes(IApplicationDbContext db)
    {
        var result = await db.WorkTypes.AsNoTracking()
            .Select(t => new { t.Id, t.Name })
            .ToListAsync();
        return TypedResults.Ok<object>(result);
    }

    public async Task<Ok<object>> GetWards(IApplicationDbContext db)
    {
        var result = await db.Wards.AsNoTracking()
            .Select(w => new { w.Id, w.Name })
            .ToListAsync();
        return TypedResults.Ok<object>(result);
    }

    public async Task<Ok<object>> GetStreets(IApplicationDbContext db, int? wardId)
    {
        var q = db.Streets.AsNoTracking();
        if (wardId.HasValue) q = q.Where(s => s.WardId == wardId.Value);
        var result = await q.Select(s => new { s.Id, s.Name, s.WardId }).ToListAsync();
        return TypedResults.Ok<object>(result);
    }
}
