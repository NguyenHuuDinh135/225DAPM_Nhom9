using backend.Application.Planning.Commands.ApprovePlan;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Planning.Commands;

public class ApprovePlanCommandValidatorTests
{
    private readonly ApprovePlanCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new ApprovePlanCommand
        {
            Id = 1,
            ApproverId = "director-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_zero()
    {
        var command = new ApprovePlanCommand
        {
            Id = 0,
            ApproverId = "director-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ApprovePlanCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_negative()
    {
        var command = new ApprovePlanCommand
        {
            Id = -1,
            ApproverId = "director-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ApprovePlanCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_approver_id_is_empty()
    {
        var command = new ApprovePlanCommand
        {
            Id = 1,
            ApproverId = string.Empty
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ApprovePlanCommand.ApproverId)).ShouldBeTrue();
    }
}
