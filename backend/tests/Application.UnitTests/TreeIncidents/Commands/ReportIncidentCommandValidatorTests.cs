using backend.Application.TreeIncidents.Commands.ReportIncident;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.TreeIncidents.Commands;

public class ReportIncidentCommandValidatorTests
{
    private readonly ReportIncidentCommandValidator _validator = new();

    [Test]
    public void Should_fail_when_tree_id_is_invalid()
    {
        var command = new ReportIncidentCommand { TreeId = 0 };

        var result = _validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(ReportIncidentCommand.TreeId)).ShouldBeTrue();
    }
}
