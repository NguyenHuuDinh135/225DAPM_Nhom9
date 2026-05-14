using backend.Application.Trees.Commands;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Trees.Commands;

public class CreateTreeCommandValidatorTests
{
    private readonly CreateTreeCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = 1,
            Name = "Cây Bàng",
            Latitude = 16.0644,
            Longitude = 108.2149
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_tree_type_id_is_zero()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = 0,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateTreeCommand.TreeTypeId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_tree_type_id_is_negative()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = -1,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
    }

    [Test]
    public void Should_fail_when_latitude_out_of_range()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = 1,
            Latitude = 91.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateTreeCommand.Latitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_longitude_out_of_range()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = 1,
            Latitude = 16.0,
            Longitude = 181.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateTreeCommand.Longitude)).ShouldBeTrue();
    }

    [Test]
    public void Should_pass_when_latitude_and_longitude_are_null()
    {
        var command = new CreateTreeCommand
        {
            TreeTypeId = 1,
            Latitude = null,
            Longitude = null
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }
}
