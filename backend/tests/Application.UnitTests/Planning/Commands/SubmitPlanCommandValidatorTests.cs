using backend.Application.Planning.Commands.SubmitPlan;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Planning.Commands;

public class SubmitPlanCommandValidatorTests
{
    private readonly SubmitPlanCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_id()
    {
        var command = new SubmitPlanCommand(1);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_zero()
    {
        var command = new SubmitPlanCommand(0);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(SubmitPlanCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_negative()
    {
        var command = new SubmitPlanCommand(-5);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(SubmitPlanCommand.Id)).ShouldBeTrue();
    }
}
