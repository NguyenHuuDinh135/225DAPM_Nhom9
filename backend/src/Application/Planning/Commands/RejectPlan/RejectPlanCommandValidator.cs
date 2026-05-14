using FluentValidation;

namespace backend.Application.Planning.Commands.RejectPlan;

public class RejectPlanCommandValidator : AbstractValidator<RejectPlanCommand>
{
    public RejectPlanCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");

        RuleFor(v => v.Reason)
            .NotEmpty().WithMessage("Lý do từ chối không được để trống.");
    }
}
