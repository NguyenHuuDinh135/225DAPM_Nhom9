using FluentValidation;

namespace backend.Application.Trees.Commands.DeleteTree;

public class DeleteTreeCommandValidator : AbstractValidator<DeleteTreeCommand>
{
    public DeleteTreeCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");
    }
}
