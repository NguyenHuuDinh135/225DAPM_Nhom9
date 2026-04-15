namespace backend.Application.Employees.Queries.GetEmployees;

public class EmployeesVm
{
    public IList<EmployeeDto> Employees { get; init; } = new List<EmployeeDto>();
}

public class EmployeeDto
{
    public string Id { get; init; } = string.Empty;
    public string? UserName { get; init; }
    public string? Email { get; init; }
}
