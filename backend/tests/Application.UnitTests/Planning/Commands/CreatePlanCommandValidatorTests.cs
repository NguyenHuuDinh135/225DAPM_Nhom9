using backend.Application.Planning.Commands.CreatePlan;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Planning.Commands;

public class CreatePlanCommandValidatorTests
{
    private readonly CreatePlanCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new CreatePlanCommand
        {
            Name = "Kế hoạch bảo trì Q1",
            CreatorId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_name_is_empty()
    {
        var command = new CreatePlanCommand
        {
            Name = string.Empty,
            CreatorId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreatePlanCommand.Name)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_name_is_null()
    {
        var command = new CreatePlanCommand
        {
            Name = null,
            CreatorId = "user-1"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreatePlanCommand.Name)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_creator_id_is_empty()
    {
        var command = new CreatePlanCommand
        {
            Name = "Kế hoạch bảo trì Q1",
            CreatorId = string.Empty
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreatePlanCommand.CreatorId)).ShouldBeTrue();
    }
}
