using backend.Application.Common.Interfaces;
using backend.Application.Employees.Queries.GetEmployees;

namespace backend.Application.Employees.Queries.GetEmployees;

public record GetEmployeesQuery : IRequest<EmployeesVm>
{
}

public class GetEmployeesQueryValidator : AbstractValidator<GetEmployeesQuery>
{
    public GetEmployeesQueryValidator()
    {
    }
}

public class GetEmployeesQueryHandler : IRequestHandler<GetEmployeesQuery, EmployeesVm>
{
    private readonly IApplicationDbContext _context;

    public GetEmployeesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeesVm> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
