using FluentValidation;

namespace backend.Application.Planning.Commands.SubmitPlan;

public class SubmitPlanCommandValidator : AbstractValidator<SubmitPlanCommand>
{
    public SubmitPlanCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");
    }
}
