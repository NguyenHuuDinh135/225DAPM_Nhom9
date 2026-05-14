using FluentValidation;

namespace backend.Application.WorkItems.Commands.ApproveWorkItem;

public class ApproveWorkItemCommandValidator : AbstractValidator<ApproveWorkItemCommand>
{
    public ApproveWorkItemCommandValidator()
    {
        RuleFor(v => v.WorkItemId)
            .GreaterThan(0).WithMessage("WorkItemId phải lớn hơn 0.");
    }
}
