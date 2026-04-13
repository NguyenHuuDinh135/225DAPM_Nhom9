using backend.Domain.Entities;

namespace backend.Application.Locations.Queries.GetLocations;

public class LocationDto
{
    public int Id { get; init; }

    public int StreetId { get; init; }

    public string? StreetName { get; init; }

    public int WardId { get; init; }

    public string? WardName { get; init; }

    public int? HouseNumber { get; init; }

    public decimal? Longitude { get; init; }

    public decimal? Latitude { get; init; }

    public string? Description { get; init; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Location, LocationDto>()
                .ForMember(d => d.StreetName, opt => opt.MapFrom(s => s.Street.Name))
                .ForMember(d => d.WardId, opt => opt.MapFrom(s => s.Street.WardId))
                .ForMember(d => d.WardName, opt => opt.MapFrom(s => s.Street.Ward.Name));
        }
    }
}
