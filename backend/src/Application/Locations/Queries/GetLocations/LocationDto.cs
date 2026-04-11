using backend.Domain.Entities;

namespace backend.Application.Locations.Queries.GetLocations;

public class LocationDto
{
    public int Id { get; init; }

    public int StreetId { get; init; }

    public int? HouseNumber { get; init; }

    public decimal? Longitude { get; init; }

    public decimal? Latitude { get; init; }

    public string? Description { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Location, LocationDto>();
        }
    }
}
