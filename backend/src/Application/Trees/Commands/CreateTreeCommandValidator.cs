using FluentValidation;

namespace backend.Application.Trees.Commands;

public class CreateTreeCommandValidator : AbstractValidator<CreateTreeCommand>
{
    public CreateTreeCommandValidator()
    {
        RuleFor(v => v.TreeTypeId)
            .GreaterThan(0).WithMessage("TreeTypeId phải lớn hơn 0.");

        RuleFor(v => v.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude phải nằm trong khoảng -90 đến 90.")
            .When(v => v.Latitude.HasValue);

        RuleFor(v => v.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude phải nằm trong khoảng -180 đến 180.")
            .When(v => v.Longitude.HasValue);
    }
}
