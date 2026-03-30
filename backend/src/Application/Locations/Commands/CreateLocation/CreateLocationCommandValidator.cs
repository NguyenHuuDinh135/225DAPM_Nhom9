namespace backend.Application.Locations.Commands.CreateLocation;

public class CreateLocationCommandValidator : AbstractValidator<CreateLocationCommand>
{
    public CreateLocationCommandValidator()
    {
        RuleFor(v => v.StreetId)
            .GreaterThan(0)
            .WithMessage("'{PropertyName}' must be greater than 0.");

        RuleFor(v => v.Description)
            .MaximumLength(500)
            .WithMessage("'{PropertyName}' must not exceed 500 characters.");
    }
}
