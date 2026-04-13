using backend.Application.Common.Security;
using backend.Application.Users.Common;

namespace backend.Application.Users.Queries.GetProfile;

[Authorize]
public record GetProfileQuery : IRequest<UserDto>;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, UserDto>
{
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public GetProfileQueryHandler(IUser user, IIdentityService identityService)
    {
        _user = user;
        _identityService = identityService;
    }

    public async Task<UserDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_user.Id))
        {
            throw new UnauthorizedAccessException();
        }

        var user = await _identityService.GetUserByIdAsync(_user.Id, cancellationToken);

        Guard.Against.NotFound(_user.Id, user);

        return user;
    }
}
