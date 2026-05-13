using FluentValidation;

namespace backend.Application.WorkItems.Commands.DeleteWorkItem;

public class DeleteWorkItemCommandValidator : AbstractValidator<DeleteWorkItemCommand>
{
    public DeleteWorkItemCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");
    }
}
