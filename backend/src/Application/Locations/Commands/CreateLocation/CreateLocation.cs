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
        var entity = new Location
        {
            StreetId = request.StreetId,
            HouseNumber = request.HouseNumber,
            Longitude = request.Longitude,
            Latitude = request.Latitude,
            Description = request.Description
        };

        _context.Locations.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
