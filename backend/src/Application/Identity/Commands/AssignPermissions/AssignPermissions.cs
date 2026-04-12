using backend.Application.Common.Interfaces;

using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Identity.Commands.AssignPermissions;

public record AssignPermissionsCommand : IRequest<IStatusResult>
{
}

public class AssignPermissionsCommandValidator : AbstractValidator<AssignPermissionsCommand>
{
    public AssignPermissionsCommandValidator()
    {
    }
}

public class AssignPermissionsCommandHandler : IRequestHandler<AssignPermissionsCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public AssignPermissionsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(AssignPermissionsCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
