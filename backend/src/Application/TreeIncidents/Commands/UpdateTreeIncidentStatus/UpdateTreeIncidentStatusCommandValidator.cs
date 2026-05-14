using FluentValidation;

namespace backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;

public class UpdateTreeIncidentStatusCommandValidator : AbstractValidator<UpdateTreeIncidentStatusCommand>
{
    public UpdateTreeIncidentStatusCommandValidator()
    {
        RuleFor(v => v.Id)
            .GreaterThan(0).WithMessage("Id phải lớn hơn 0.");

        RuleFor(v => v.Status)
            .IsInEnum().WithMessage("Status không hợp lệ.");
    }
}
