using backend.Application.Employees.Commands.ManageEmployees;
using backend.Application.Employees.Queries.GetEmployees;
using backend.Application.Identity.Commands.AssignPermissions;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Employees : EndpointGroupBase
{
    public override string? GroupName => "employees";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Temporary: Disable authorization for testing
        groupBuilder.MapGet("", GetEmployees).AllowAnonymous();
        groupBuilder.MapPost("", CreateEmployee).AllowAnonymous();
        groupBuilder.MapPut("{id}", UpdateEmployee).AllowAnonymous();
        groupBuilder.MapDelete("{id}", DeleteEmployee).AllowAnonymous();
        groupBuilder.MapPut("{id}/roles", AssignRole).AllowAnonymous();
    }

    public async Task<EmployeesVm> GetEmployees(ISender sender)
        => await sender.Send(new GetEmployeesQuery());

    public async Task<Results<NoContent, BadRequest<string[]>>> CreateEmployee(ISender sender, CreateEmployeeCommand command)
    {
        var result = await sender.Send(command);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdateEmployee(ISender sender, string id, UpdateEmployeeCommand command)
    {
        var result = await sender.Send(command with { UserId = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeleteEmployee(ISender sender, string id)
    {
        var result = await sender.Send(new DeleteEmployeeCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> AssignRole(ISender sender, string id, AssignPermissionsCommand command)
    {
        var result = await sender.Send(command with { UserId = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
