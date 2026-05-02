using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Employees.Commands.ManageEmployees;

public record DeleteEmployeeCommand(string UserId) : IRequest<Result>;

public class DeleteEmployeeCommandHandler(IIdentityService identityService) : IRequestHandler<DeleteEmployeeCommand, Result>
{
    public async Task<Result> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var result = await identityService.DeleteUserAsync(request.UserId);
        return result.Succeeded ? Result.Success() : Result.Failure(result.Errors);
    }
}
