using backend.Application.TreeIncidents.Commands.CreateIncident;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.TreeIncidents.Commands;

public class CreateIncidentCommandValidatorTests
{
    private readonly CreateIncidentCommandValidator _validator = new();

    [Test]
    public void Should_fail_when_tree_id_is_invalid()
    {
        var command = new CreateIncidentCommand { TreeId = 0, ReporterId = "user-1" };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateIncidentCommand.TreeId)).ShouldBeTrue();
    }

    [Test]
    public void Should_fail_when_reporter_id_is_missing()
    {
        var command = new CreateIncidentCommand { TreeId = 10, ReporterId = string.Empty };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateIncidentCommand.ReporterId)).ShouldBeTrue();
    }
}
