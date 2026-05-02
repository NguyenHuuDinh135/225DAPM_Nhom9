using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Employees.Commands.ManageEmployees;

public record CreateEmployeeCommand(string Email, string Password, string FullName, string Role) : IRequest<Result>;

public class CreateEmployeeCommandHandler(IIdentityService identityService) : IRequestHandler<CreateEmployeeCommand, Result>
{
    public async Task<Result> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var (result, _) = await identityService.CreateEmployeeAsync(request.Email, request.Password, request.FullName, request.Role);
        return result.Succeeded ? Result.Success() : Result.Failure(result.Errors);
    }
}
