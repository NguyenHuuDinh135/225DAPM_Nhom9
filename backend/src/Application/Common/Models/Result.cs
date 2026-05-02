namespace backend.Application.Common.Models;

public class Result
{
    internal Result(bool succeeded, IEnumerable<string> errors)
    {
        Succeeded = succeeded;
        Errors = errors.ToArray();
    }

    public bool Succeeded { get; init; }

    public string[] Errors { get; init; }

    public static Result Success()
    {
        return new Result(true, Array.Empty<string>());
    }

    public static Result Failure(IEnumerable<string> errors)
    {
        return new Result(false, errors);
    }

    public static Result Failure(params string[] errors)
    {
        return new Result(false, errors);
    }
}

public class Result<T> : Result
{
    internal Result(bool succeeded, IEnumerable<string> errors, T? value = default)
        : base(succeeded, errors)
    {
        Value = value;
    }

    public T? Value { get; init; }

    public static Result<T> Success(T value)
    {
        return new Result<T>(true, Array.Empty<string>(), value);
    }

    public new static Result<T> Failure(IEnumerable<string> errors)
    {
        return new Result<T>(false, errors);
    }

    public new static Result<T> Failure(params string[] errors)
    {
        return new Result<T>(false, errors);
    }
}
