using backend.Application.WorkItems.Commands.ApproveWorkItem;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.WorkItems.Commands;

public class ApproveWorkItemCommandValidatorTests
{
    private readonly ApproveWorkItemCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_work_item_id()
    {
        var command = new ApproveWorkItemCommand
        {
            WorkItemId = 1,
            IsApproved = true
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_work_item_id_is_zero()
    {
        var command = new ApproveWorkItemCommand
        {
            WorkItemId = 0,
            IsApproved = true
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ApproveWorkItemCommand.WorkItemId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_work_item_id_is_negative()
    {
        var command = new ApproveWorkItemCommand
        {
            WorkItemId = -1,
            IsApproved = true
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ApproveWorkItemCommand.WorkItemId)).ShouldBeTrue();
    }
}
