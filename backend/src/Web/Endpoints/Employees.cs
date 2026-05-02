using backend.Application.Employees.Commands.ManageEmployees;
using backend.Application.Employees.Queries.GetEmployees;
using backend.Application.Identity.Commands.AssignPermissions;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Employees : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet("", GetEmployees).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPost("", CreateEmployee).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPut("{id}", UpdateEmployee).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapDelete("{id}", DeleteEmployee).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapPut("{id}/roles", AssignRole).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
    }

    public async Task<EmployeesVm> GetEmployees(ISender sender, ILogger<Employees> logger)
    {
        var result = await sender.Send(new GetEmployeesQuery());
        logger.LogInformation("GetEmployees returned {Count} employees", result.Employees.Count);
        return result;
    }

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
