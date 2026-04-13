namespace backend.Application.Locations.Commands.UpdateLocation;

public class UpdateLocationCommandValidator : AbstractValidator<UpdateLocationCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateLocationCommandValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Id)
            .GreaterThan(0)
            .WithMessage("'{PropertyName}' must be greater than 0.");

        RuleFor(v => v.StreetId)
            .GreaterThan(0)
            .WithMessage("'{PropertyName}' must be greater than 0.")
            .MustAsync(StreetExists)
            .WithMessage("Street does not exist.");

        RuleFor(v => v.HouseNumber)
            .GreaterThan(0)
            .When(v => v.HouseNumber.HasValue)
            .WithMessage("'{PropertyName}' must be greater than 0.");

        RuleFor(v => v.Longitude)
            .InclusiveBetween(-180m, 180m)
            .When(v => v.Longitude.HasValue)
            .WithMessage("'{PropertyName}' must be between -180 and 180.");

        RuleFor(v => v.Longitude)
            .NotNull()
            .When(v => v.Latitude.HasValue)
            .WithMessage("'{PropertyName}' is required when Latitude is provided.");

        RuleFor(v => v.Latitude)
            .InclusiveBetween(-90m, 90m)
            .When(v => v.Latitude.HasValue)
            .WithMessage("'{PropertyName}' must be between -90 and 90.");

        RuleFor(v => v.Latitude)
            .NotNull()
            .When(v => v.Longitude.HasValue)
            .WithMessage("'{PropertyName}' is required when Longitude is provided.");

        RuleFor(v => v.Description)
            .MaximumLength(500)
            .WithMessage("'{PropertyName}' must not exceed 500 characters.");
    }

    public async Task<bool> StreetExists(int streetId, CancellationToken cancellationToken)
    {
        return await _context.Streets.AnyAsync(s => s.Id == streetId, cancellationToken);
    }
}
