namespace backend.Application.Lookups.Queries.GetLookups;

public record TreeTypeLookupDto(int Id, string Name, string? Group);
public record WorkTypeLookupDto(int Id, string Name);
public record WardLookupDto(int Id, string Name);
public record StreetLookupDto(int Id, string Name, int WardId);

public record GetTreeTypesLookupQuery : IRequest<List<TreeTypeLookupDto>>;
public record GetWorkTypesLookupQuery : IRequest<List<WorkTypeLookupDto>>;
public record GetWardsLookupQuery : IRequest<List<WardLookupDto>>;
public record GetStreetsLookupQuery(int? WardId) : IRequest<List<StreetLookupDto>>;

public class GetTreeTypesLookupQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTreeTypesLookupQuery, List<TreeTypeLookupDto>>
{
    public async Task<List<TreeTypeLookupDto>> Handle(GetTreeTypesLookupQuery request, CancellationToken cancellationToken)
    {
        return await context.TreeTypes.AsNoTracking()
            .Select(t => new TreeTypeLookupDto(t.Id, t.Name ?? "Chưa xác định", t.Group))
            .ToListAsync(cancellationToken);
    }
}

public class GetWorkTypesLookupQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetWorkTypesLookupQuery, List<WorkTypeLookupDto>>
{
    public async Task<List<WorkTypeLookupDto>> Handle(GetWorkTypesLookupQuery request, CancellationToken cancellationToken)
    {
        return await context.WorkTypes.AsNoTracking()
            .Select(t => new WorkTypeLookupDto(t.Id, t.Name ?? "Chưa xác định"))
            .ToListAsync(cancellationToken);
    }
}

public class GetWardsLookupQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetWardsLookupQuery, List<WardLookupDto>>
{
    public async Task<List<WardLookupDto>> Handle(GetWardsLookupQuery request, CancellationToken cancellationToken)
    {
        return await context.Wards.AsNoTracking()
            .Select(w => new WardLookupDto(w.Id, w.Name))
            .ToListAsync(cancellationToken);
    }
}

public class GetStreetsLookupQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetStreetsLookupQuery, List<StreetLookupDto>>
{
    public async Task<List<StreetLookupDto>> Handle(GetStreetsLookupQuery request, CancellationToken cancellationToken)
    {
        var query = context.Streets.AsNoTracking();
        if (request.WardId.HasValue)
        {
            query = query.Where(s => s.WardId == request.WardId.Value);
        }

        return await query
            .Select(s => new StreetLookupDto(s.Id, s.Name, s.WardId))
            .ToListAsync(cancellationToken);
    }
}
