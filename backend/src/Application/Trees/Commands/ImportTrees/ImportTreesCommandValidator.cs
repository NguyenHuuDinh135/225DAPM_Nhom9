using FluentValidation;

namespace backend.Application.Trees.Commands.ImportTrees;

public class ImportTreesCommandValidator : AbstractValidator<ImportTreesCommand>
{
    public ImportTreesCommandValidator()
    {
        RuleFor(v => v.TreeTypeId)
            .NotEmpty().WithMessage("Vui lòng chọn loại cây.");

        RuleFor(v => v.Quantity)
            .GreaterThan(0).WithMessage("Số lượng nhập phải lớn hơn 0.")
            .LessThanOrEqualTo(1000).WithMessage("Chỉ được nhập tối đa 1000 cây mỗi lô để tránh treo hệ thống.");
            
        RuleFor(v => v.BatchNumber)
            .MaximumLength(50).WithMessage("Mã lô không được vượt quá 50 ký tự.");
    }
}
