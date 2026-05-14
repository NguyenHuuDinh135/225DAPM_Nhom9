using backend.Application.WorkItems.Commands.AssignUserToWork;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.WorkItems.Commands;

public class AssignUserToWorkCommandValidatorTests
{
    private readonly AssignUserToWorkCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new AssignUserToWorkCommand
        {
            WorkId = 1,
            UserId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_work_id_is_zero()
    {
        var command = new AssignUserToWorkCommand
        {
            WorkId = 0,
            UserId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(AssignUserToWorkCommand.WorkId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_work_id_is_negative()
    {
        var command = new AssignUserToWorkCommand
        {
            WorkId = -1,
            UserId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(AssignUserToWorkCommand.WorkId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_user_id_is_empty()
    {
        var command = new AssignUserToWorkCommand
        {
            WorkId = 1,
            UserId = string.Empty
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(AssignUserToWorkCommand.UserId)).ShouldBeTrue();
    }
}
