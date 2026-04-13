using backend.Application.Users.Common;

namespace backend.Application.Users.Queries.GetUsers;

public class UsersVm
{
    public IReadOnlyCollection<UserDto> Users { get; init; } = Array.Empty<UserDto>();
}
