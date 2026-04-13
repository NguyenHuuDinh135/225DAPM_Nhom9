using backend.Application.Common.Security;
using backend.Domain.Constants;

namespace backend.Application.Users.Queries.GetUsers;

[Authorize(Roles = Roles.Administrator)]
public record GetUsersQuery : IRequest<UsersVm>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, UsersVm>
{
    private readonly IIdentityService _identityService;

    public GetUsersQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<UsersVm> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        return new UsersVm
        {
            Users = await _identityService.GetUsersAsync(cancellationToken)
        };
    }
}
