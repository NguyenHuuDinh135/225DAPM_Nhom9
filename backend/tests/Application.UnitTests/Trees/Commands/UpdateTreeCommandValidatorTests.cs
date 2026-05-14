using backend.Application.Trees.Commands.UpdateTree;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Trees.Commands;

public class UpdateTreeCommandValidatorTests
{
    private readonly UpdateTreeCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new UpdateTreeCommand
        {
            Id = 1,
            Name = "Cây Bàng",
            Condition = "Tốt",
            TreeTypeId = 1,
            Latitude = 16.0644,
            Longitude = 108.2149,
            Height = 5.0m,
            TrunkDiameter = 0.3m
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_zero()
    {
        var command = new UpdateTreeCommand
        {
            Id = 0,
            TreeTypeId = 1,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(UpdateTreeCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_id_is_negative()
    {
        var command = new UpdateTreeCommand
        {
            Id = -1,
            TreeTypeId = 1,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(UpdateTreeCommand.Id)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_tree_type_id_is_zero()
    {
        var command = new UpdateTreeCommand
        {
            Id = 1,
            TreeTypeId = 0,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(UpdateTreeCommand.TreeTypeId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_tree_type_id_is_negative()
    {
        var command = new UpdateTreeCommand
        {
            Id = 1,
            TreeTypeId = -5,
            Latitude = 16.0,
            Longitude = 108.0
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(UpdateTreeCommand.TreeTypeId)).ShouldBeTrue();
    }

    [Test]
    public void Should_pass_when_optional_fields_are_null()
    {
        var command = new UpdateTreeCommand
        {
            Id = 1,
            TreeTypeId = 1,
            Latitude = 16.0,
            Longitude = 108.0,
            Name = null,
            Condition = null,
            Height = null,
            TrunkDiameter = null,
            MainImageUrl = null
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }
}
