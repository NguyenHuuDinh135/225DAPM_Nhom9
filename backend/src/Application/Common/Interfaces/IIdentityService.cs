using backend.Application.Common.Models;
using backend.Domain.Enums;

namespace backend.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<string?> GetUserNameAsync(string userId);
    Task<bool> IsInRoleAsync(string userId, string role);
    Task<bool> AuthorizeAsync(string userId, string policyName);
    Task<(Result Result, string UserId)> CreateUserAsync(string userName, string password);
    Task<Result> DeleteUserAsync(string userId);

    // Employee management
    Task<List<UserDto>> GetUsersAsync();
    Task<(Result Result, string UserId)> CreateEmployeeAsync(string email, string password, string fullName, string role);
    Task<Result> UpdateEmployeeAsync(string userId, string? fullName, UserStatus? status);
    Task<Result> AssignRoleAsync(string userId, string role);
}

public class UserDto
{
    public string Id { get; init; } = string.Empty;
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public string? FullName { get; init; }
    public UserStatus Status { get; init; }
    public string? Role { get; init; }
}
