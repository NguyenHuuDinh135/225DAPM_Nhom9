using backend.Application.Locations.Queries.GetLocations;

namespace backend.Application.Locations.Queries.GetLocationById;

public record GetLocationByIdQuery(int Id) : IRequest<LocationDto>;

public class GetLocationByIdQueryHandler : IRequestHandler<GetLocationByIdQuery, LocationDto>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetLocationByIdQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<LocationDto> Handle(GetLocationByIdQuery request, CancellationToken cancellationToken)
    {
        var location = await _context.Locations
            .AsNoTracking()
            .Where(l => l.Id == request.Id)
            .ProjectTo<LocationDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, location);

        return location;
    }
}
