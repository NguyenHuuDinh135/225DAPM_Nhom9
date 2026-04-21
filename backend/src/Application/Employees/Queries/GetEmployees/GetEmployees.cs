using backend.Application.Common.Interfaces;

namespace backend.Application.Employees.Queries.GetEmployees;

public record GetEmployeesQuery : IRequest<EmployeesVm>;

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, EmployeesVm>
{
    private readonly IIdentityService _identityService;
    public GetEmployeesQueryHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<EmployeesVm> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var users = await _identityService.GetUsersAsync();
        return new EmployeesVm
        {
            Employees = users.Select(u => new EmployeeDto
            {
                Id = u.Id,
                UserName = u.UserName,
                Email = u.Email,
                FullName = u.FullName,
                Status = u.Status,
                Role = u.Role
            }).ToList()
        };
    }
}
