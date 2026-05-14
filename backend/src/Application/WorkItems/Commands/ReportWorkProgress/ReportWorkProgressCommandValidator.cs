using FluentValidation;

namespace backend.Application.WorkItems.Commands.ReportWorkProgress;

public class ReportWorkProgressCommandValidator : AbstractValidator<ReportWorkProgressCommand>
{
    public ReportWorkProgressCommandValidator()
    {
        RuleFor(v => v.WorkItemId)
            .GreaterThan(0).WithMessage("WorkItemId phải lớn hơn 0.");

        RuleFor(v => v.UpdaterId)
            .NotEmpty().WithMessage("UpdaterId không được để trống.");

        RuleFor(v => v.Percentage)
            .InclusiveBetween(0, 100).WithMessage("Percentage phải nằm trong khoảng 0 đến 100.")
            .When(v => v.Percentage.HasValue);
    }
}
