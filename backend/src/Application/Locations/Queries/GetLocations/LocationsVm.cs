namespace backend.Application.Locations.Queries.GetLocations;

public class LocationsVm
{
    public IReadOnlyCollection<LocationDto> Locations { get; init; } = Array.Empty<LocationDto>();
}
