using backend.Application.Planning.Commands.RejectPlan;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Planning.Commands;

public class RejectPlanCommandValidatorTests
{
    private readonly RejectPlanCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new RejectPlanCommand
        {
            Id = 1,
            Reason = "Kế hoạch chưa đủ chi tiết"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_zero()
    {
        var command = new RejectPlanCommand
        {
            Id = 0,
            Reason = "Lý do từ chối"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RejectPlanCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_negative()
    {
        var command = new RejectPlanCommand
        {
            Id = -1,
            Reason = "Lý do từ chối"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RejectPlanCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_reason_is_empty()
    {
        var command = new RejectPlanCommand
        {
            Id = 1,
            Reason = string.Empty
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RejectPlanCommand.Reason)).ShouldBeTrue();
    }
}
