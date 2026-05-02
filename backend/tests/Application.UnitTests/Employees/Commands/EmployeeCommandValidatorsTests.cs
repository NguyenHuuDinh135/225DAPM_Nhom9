using backend.Application.Employees.Commands.ManageEmployees;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Employees.Commands;

public class EmployeeCommandValidatorsTests
{
    [Test]
    public void CreateEmployeeValidator_should_fail_for_invalid_email()
    {
        var validator = new CreateEmployeeCommandValidator();
        var command = new CreateEmployeeCommand("invalid-email", "123456", "Tester", "Manager");

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(CreateEmployeeCommand.Email)).ShouldBeTrue();
    }

    [Test]
    public void UpdateEmployeeValidator_should_fail_when_user_id_missing()
    {
        var validator = new UpdateEmployeeCommandValidator();
        var command = new UpdateEmployeeCommand { UserId = string.Empty };

        var result = validator.Validate(command);

        result.IsValid.ShouldBeFalse();
        result.Errors.Any(e => e.PropertyName == nameof(UpdateEmployeeCommand.UserId)).ShouldBeTrue();
    }
}
