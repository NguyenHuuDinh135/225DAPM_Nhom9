namespace backend.Application.Locations.Commands.UpdateLocation;

public record UpdateLocationCommand : IRequest
{
    public int Id { get; init; }

    public int StreetId { get; init; }

    public int? HouseNumber { get; init; }

    public decimal? Longitude { get; init; }

    public decimal? Latitude { get; init; }

    public string? Description { get; init; }
}

public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Locations
            .FindAsync(new object[] { request.Id }, cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        entity.StreetId = request.StreetId;
        entity.HouseNumber = request.HouseNumber;
        entity.Longitude = request.Longitude;
        entity.Latitude = request.Latitude;
        entity.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
