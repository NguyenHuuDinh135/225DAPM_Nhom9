using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Locations.Commands.CreateLocation;

public record CreateLocationCommand : IRequest<int>
{
    public int StreetId { get; init; }

    public int? HouseNumber { get; init; }

    public decimal? Longitude { get; init; }

    public decimal? Latitude { get; init; }

    public string? Description { get; init; }
}

public class CreateLocationCommandHandler : IRequestHandler<CreateLocationCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = new Location();

        typeof(Location).GetProperty(nameof(Location.StreetId))!.SetValue(entity, request.StreetId);
        typeof(Location).GetProperty(nameof(Location.HouseNumber))!.SetValue(entity, request.HouseNumber);
        typeof(Location).GetProperty(nameof(Location.Longitude))!.SetValue(entity, request.Longitude);
        typeof(Location).GetProperty(nameof(Location.Latitude))!.SetValue(entity, request.Latitude);
        typeof(Location).GetProperty(nameof(Location.Description))!.SetValue(entity, request.Description);

        _context.Locations.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
