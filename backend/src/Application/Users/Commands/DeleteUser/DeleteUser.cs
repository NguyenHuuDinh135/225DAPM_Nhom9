using backend.Application.Common.Exceptions;
using backend.Application.Common.Security;
using backend.Domain.Constants;
using FluentValidation.Results;

namespace backend.Application.Users.Commands.DeleteUser;

[Authorize(Roles = Roles.Administrator)]
public record DeleteUserCommand(string Id) : IRequest;

public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand>
{
    private readonly IIdentityService _identityService;

    public DeleteUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _identityService.GetUserByIdAsync(request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, user);

        var result = await _identityService.DeleteUserAsync(request.Id);

        if (!result.Succeeded)
        {
            throw new backend.Application.Common.Exceptions.ValidationException(
                result.Errors.Select(error => new ValidationFailure("Identity", error)));
        }
    }
}
