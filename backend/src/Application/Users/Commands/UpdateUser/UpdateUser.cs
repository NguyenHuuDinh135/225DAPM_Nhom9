using backend.Application.Common.Exceptions;
using backend.Application.Common.Security;
using backend.Application.Users.Common;
using backend.Domain.Constants;
using backend.Domain.Enums;
using FluentValidation.Results;

namespace backend.Application.Users.Commands.UpdateUser;

[Authorize(Roles = backend.Domain.Constants.Roles.Administrator)]
public record UpdateUserCommand : IRequest
{
    public string Id { get; init; } = string.Empty;

    public string Email { get; init; } = string.Empty;

    public string? FullName { get; init; }

    public string? PhoneNumber { get; init; }

    public DateTime? DateOfBirth { get; init; }

    public int? WardId { get; init; }

    public UserStatus Status { get; init; } = UserStatus.Active;

    public IReadOnlyCollection<string> Roles { get; init; } = Array.Empty<string>();
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand>
{
    private readonly IIdentityService _identityService;

    public UpdateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _identityService.GetUserByIdAsync(request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, user);

        var result = await _identityService.UpdateUserAsync(new UpdateUserModel
        {
            Id = request.Id,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            WardId = request.WardId,
            Status = request.Status,
            Roles = request.Roles
        }, cancellationToken);

        if (!result.Succeeded)
        {
            throw new backend.Application.Common.Exceptions.ValidationException(
                result.Errors.Select(error => new ValidationFailure("Identity", error)));
        }
    }
}
