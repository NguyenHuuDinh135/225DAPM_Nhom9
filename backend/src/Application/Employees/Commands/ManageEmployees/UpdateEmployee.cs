using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.Employees.Commands.ManageEmployees;

public record UpdateEmployeeCommand : IRequest<Result>
{
    public string UserId { get; init; } = string.Empty;
    public string? FullName { get; init; }
    public UserStatus? Status { get; init; }
}

public class UpdateEmployeeCommandHandler(IIdentityService identityService) : IRequestHandler<UpdateEmployeeCommand, Result>
{
    public async Task<Result> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var result = await identityService.UpdateEmployeeAsync(request.UserId, request.FullName, request.Status);
        return result.Succeeded ? Result.Success() : Result.Failure(result.Errors);
    }
}
