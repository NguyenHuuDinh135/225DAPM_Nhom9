using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Identity.Commands.AssignPermissions;

public record AssignPermissionsCommand : IRequest<Result>
{
    public string UserId { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

public class AssignPermissionsCommandHandler : IRequestHandler<AssignPermissionsCommand, Result>
{
    private readonly IIdentityService _identityService;
    public AssignPermissionsCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<Result> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.AssignRoleAsync(request.UserId, request.Role);
        return result.Succeeded ? Result.Success() : Result.Failure(result.Errors);
    }
}
