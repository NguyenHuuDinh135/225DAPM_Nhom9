using FluentValidation;

namespace backend.Application.WorkItems.Commands.AssignUserToWork;

public class AssignUserToWorkCommandValidator : AbstractValidator<AssignUserToWorkCommand>
{
    public AssignUserToWorkCommandValidator()
    {
        RuleFor(v => v.WorkId)
            .GreaterThan(0).WithMessage("WorkId phải lớn hơn 0.");

        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId không được để trống.");
    }
}
