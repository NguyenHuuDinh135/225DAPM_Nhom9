using FluentValidation;

namespace backend.Application.Planning.Commands.RequestRevision;

public class RequestRevisionCommandValidator : AbstractValidator<RequestRevisionCommand>
{
    public RequestRevisionCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");

        RuleFor(v => v.Reason)
            .NotEmpty().WithMessage("Lý do yêu cầu chỉnh sửa không được để trống.");
    }
}
