using backend.Application.Trees.Commands.RelocateTree;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Trees.Commands;

public class RelocateTreeCommandValidatorTests
{
    private readonly RelocateTreeCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new RelocateTreeCommand(1, 16.0644, 108.2149);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_zero()
    {
        var command = new RelocateTreeCommand(0, 16.0644, 108.2149);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_negative()
    {
        var command = new RelocateTreeCommand(-1, 16.0644, 108.2149);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_latitude_is_above_90()
    {
        var command = new RelocateTreeCommand(1, 91.0, 108.2149);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Latitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_latitude_is_below_negative_90()
    {
        var command = new RelocateTreeCommand(1, -91.0, 108.2149);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Latitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_pass_when_latitude_is_at_boundary()
    {
        var commandMin = new RelocateTreeCommand(1, -90.0, 108.0);
        var commandMax = new RelocateTreeCommand(1, 90.0, 108.0);

        _validator.Validate(commandMin).IsValid.ShouldBeTrue();
        _validator.Validate(commandMax).IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_longitude_is_above_180()
    {
        var command = new RelocateTreeCommand(1, 16.0644, 181.0);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Longitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_longitude_is_below_negative_180()
    {
        var command = new RelocateTreeCommand(1, 16.0644, -181.0);

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(RelocateTreeCommand.Longitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_pass_when_longitude_is_at_boundary()
    {
        var commandMin = new RelocateTreeCommand(1, 16.0, -180.0);
        var commandMax = new RelocateTreeCommand(1, 16.0, 180.0);

        _validator.Validate(commandMin).IsValid.ShouldBeTrue();
        _validator.Validate(commandMax).IsValid.ShouldBeTrue();
    }
}
