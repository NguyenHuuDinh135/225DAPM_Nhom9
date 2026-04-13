using backend.Application.Common.Exceptions;
using backend.Application.Common.Security;
using backend.Application.Users.Common;
using backend.Domain.Constants;
using backend.Domain.Enums;
using FluentValidation.Results;

namespace backend.Application.Users.Commands.CreateUser;

[Authorize(Roles = backend.Domain.Constants.Roles.Administrator)]
public record CreateUserCommand : IRequest<string>
{
    public string Email { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;

    public string? FullName { get; init; }

    public string? PhoneNumber { get; init; }

    public DateTime? DateOfBirth { get; init; }

    public int? WardId { get; init; }

    public UserStatus Status { get; init; } = UserStatus.Active;

    public IReadOnlyCollection<string> Roles { get; init; } = Array.Empty<string>();
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, string>
{
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<string> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.CreateUserAsync(new CreateUserModel
        {
            Email = request.Email,
            Password = request.Password,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            WardId = request.WardId,
            Status = request.Status,
            Roles = request.Roles
        }, cancellationToken);

        if (!result.Result.Succeeded)
        {
            throw new backend.Application.Common.Exceptions.ValidationException(
                result.Result.Errors.Select(error => new ValidationFailure("Identity", error)));
        }

        return result.UserId;
    }
}
