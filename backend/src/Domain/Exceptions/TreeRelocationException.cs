namespace backend.Domain.Exceptions;

public class TreeRelocationException : InvalidOperationException
{
    public TreeRelocationException(string message)
        : base(message)
    {
    }
}
