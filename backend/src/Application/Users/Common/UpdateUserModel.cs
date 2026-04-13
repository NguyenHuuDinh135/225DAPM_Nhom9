using backend.Domain.Enums;

namespace backend.Application.Users.Common;

public class UpdateUserModel
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
