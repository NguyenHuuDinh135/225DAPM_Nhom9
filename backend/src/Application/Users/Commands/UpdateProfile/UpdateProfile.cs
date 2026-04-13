using backend.Application.Common.Exceptions;
using backend.Application.Common.Security;
using backend.Application.Users.Common;
using FluentValidation.Results;

namespace backend.Application.Users.Commands.UpdateProfile;

[Authorize]
public record UpdateProfileCommand : IRequest<UserDto>
{
    public string Email { get; init; } = string.Empty;

    public string? FullName { get; init; }

    public string? PhoneNumber { get; init; }

    public DateTime? DateOfBirth { get; init; }

    public int? WardId { get; init; }
}

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, UserDto>
{
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public UpdateProfileCommandHandler(IUser user, IIdentityService identityService)
    {
        _user = user;
        _identityService = identityService;
    }

    public async Task<UserDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_user.Id))
        {
            throw new UnauthorizedAccessException();
        }

        var user = await _identityService.GetUserByIdAsync(_user.Id, cancellationToken);

        Guard.Against.NotFound(_user.Id, user);

        var result = await _identityService.UpdateProfileAsync(new UpdateProfileModel
        {
            Id = _user.Id,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            WardId = request.WardId
        }, cancellationToken);

        if (!result.Succeeded)
        {
            throw new backend.Application.Common.Exceptions.ValidationException(
                result.Errors.Select(error => new ValidationFailure("Identity", error)));
        }

        var updatedUser = await _identityService.GetUserByIdAsync(_user.Id, cancellationToken);

        Guard.Against.NotFound(_user.Id, updatedUser);

        return updatedUser;
    }
}
