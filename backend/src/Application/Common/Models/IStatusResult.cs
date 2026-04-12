namespace backend.Application.Common.Models;

public interface IStatusResult
{
    bool Succeeded { get; }
    string[] Errors { get; }
}

public class StatusResult : IStatusResult
{
    public bool Succeeded { get; init; }
    public string[] Errors { get; init; } = [];

    public static StatusResult Success() => new() { Succeeded = true };
    public static StatusResult Failure(params string[] errors) => new() { Succeeded = false, Errors = errors };
}
