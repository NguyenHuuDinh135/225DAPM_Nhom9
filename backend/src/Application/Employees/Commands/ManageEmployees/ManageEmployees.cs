using backend.Application.Common.Interfaces;

namespace backend.Application.Employees.Commands.ManageEmployees;

public record ManageEmployeesCommand : IRequest<IStatusResult>
{
}

public class ManageEmployeesCommandValidator : AbstractValidator<ManageEmployeesCommand>
{
    public ManageEmployeesCommandValidator()
    {
    }
}

public class ManageEmployeesCommandHandler : IRequestHandler<ManageEmployeesCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public ManageEmployeesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(ManageEmployeesCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
