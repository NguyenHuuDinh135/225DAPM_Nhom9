using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.Employees.Commands.ManageEmployees;

public record CreateEmployeeCommand(string Email, string Password, string FullName, string Role) : IRequest<IStatusResult>;

public class CreateEmployeeCommandHandler : IRequestHandler<CreateEmployeeCommand, IStatusResult>
{
    private readonly IIdentityService _identityService;
    public CreateEmployeeCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<IStatusResult> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var (result, _) = await _identityService.CreateEmployeeAsync(request.Email, request.Password, request.FullName, request.Role);
        return result.Succeeded ? StatusResult.Success() : StatusResult.Failure(result.Errors);
    }
}

public record UpdateEmployeeCommand : IRequest<IStatusResult>
{
    public string UserId { get; init; } = string.Empty;
    public string? FullName { get; init; }
    public UserStatus? Status { get; init; }
}

public class UpdateEmployeeCommandHandler : IRequestHandler<UpdateEmployeeCommand, IStatusResult>
{
    private readonly IIdentityService _identityService;
    public UpdateEmployeeCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<IStatusResult> Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.UpdateEmployeeAsync(request.UserId, request.FullName, request.Status);
        return result.Succeeded ? StatusResult.Success() : StatusResult.Failure(result.Errors);
    }
}

public record DeleteEmployeeCommand(string UserId) : IRequest<IStatusResult>;

public class DeleteEmployeeCommandHandler : IRequestHandler<DeleteEmployeeCommand, IStatusResult>
{
    private readonly IIdentityService _identityService;
    public DeleteEmployeeCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<IStatusResult> Handle(DeleteEmployeeCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.DeleteUserAsync(request.UserId);
        return result.Succeeded ? StatusResult.Success() : StatusResult.Failure(result.Errors);
    }
}
