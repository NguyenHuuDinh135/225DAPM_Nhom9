using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Locations.Queries.GetLocations;

public record GetLocationsQuery : IRequest<LocationsVm>
{
}

public class GetLocationsQueryHandler : IRequestHandler<GetLocationsQuery, LocationsVm>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetLocationsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<LocationsVm> Handle(GetLocationsQuery request, CancellationToken cancellationToken)
    {
        return new LocationsVm
        {
            Locations = await _context.Locations
                .AsNoTracking()
                .OrderBy(l => l.Street.Name)
                .ThenBy(l => l.HouseNumber)
                .ThenBy(l => l.Id)
                .ProjectTo<LocationDto>(_mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken)
        };
    }
}
