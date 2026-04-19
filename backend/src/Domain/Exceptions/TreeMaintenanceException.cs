namespace backend.Domain.Exceptions;

public class TreeMaintenanceException : InvalidOperationException
{
    public TreeMaintenanceException(string message)
        : base(message)
    {
    }
}
