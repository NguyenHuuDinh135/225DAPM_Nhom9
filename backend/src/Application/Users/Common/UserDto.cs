using backend.Domain.Enums;

namespace backend.Application.Users.Common;

public class UserDto
{
    public string Id { get; init; } = string.Empty;

    public string? UserName { get; init; }

    public string? Email { get; init; }

    public string? FullName { get; init; }

    public string? PhoneNumber { get; init; }

    public DateTime? DateOfBirth { get; init; }

    public int? WardId { get; init; }

    public string? WardName { get; init; }

    public UserStatus Status { get; init; }

    public bool EmailConfirmed { get; init; }

    public IReadOnlyCollection<string> Roles { get; init; } = Array.Empty<string>();
}
