using backend.Application.WorkItems.Commands.ReportWorkProgress;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.WorkItems.Commands;

public class ReportWorkProgressValidatorTests
{
    private readonly ReportWorkProgressCommandValidator _validator = new();

    [Test]
    public void Should_pass_with_valid_input()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 1,
            UpdaterId = "user-1",
            Percentage = 50,
            Note = "Đang thực hiện"
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_work_item_id_is_zero()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 0,
            UpdaterId = "user-1",
            Percentage = 50
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ReportWorkProgressCommand.WorkItemId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_updater_id_is_empty()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 1,
            UpdaterId = string.Empty,
            Percentage = 50
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ReportWorkProgressCommand.UpdaterId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_percentage_exceeds_100()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 1,
            UpdaterId = "user-1",
            Percentage = 101
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ReportWorkProgressCommand.Percentage)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_percentage_is_negative()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 1,
            UpdaterId = "user-1",
            Percentage = -1
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ReportWorkProgressCommand.Percentage)).ShouldBeTrue();
    }

    [Test]
    public void Should_pass_when_percentage_is_null()
    {
        var command = new ReportWorkProgressCommand
        {
            WorkItemId = 1,
            UpdaterId = "user-1",
            Percentage = null
        };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeTrue();
    }
}
