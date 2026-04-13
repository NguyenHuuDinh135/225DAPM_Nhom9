using backend.Application.Common.Security;
using backend.Application.Users.Common;
using backend.Domain.Constants;

namespace backend.Application.Users.Queries.GetUserById;

[Authorize(Roles = Roles.Administrator)]
public record GetUserByIdQuery(string Id) : IRequest<UserDto>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IIdentityService _identityService;

    public GetUserByIdQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _identityService.GetUserByIdAsync(request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, user);

        return user;
    }
}
