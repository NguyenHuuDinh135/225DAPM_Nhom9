using FluentValidation;

namespace backend.Application.Trees.Commands.RelocateTree;

public class RelocateTreeCommandValidator : AbstractValidator<RelocateTreeCommand>
{
    public RelocateTreeCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");

        RuleFor(v => v.Latitude)
            .InclusiveBetween(-90, 90).WithMessage("Latitude phải nằm trong khoảng -90 đến 90.");

        RuleFor(v => v.Longitude)
            .InclusiveBetween(-180, 180).WithMessage("Longitude phải nằm trong khoảng -180 đến 180.");
    }
}
