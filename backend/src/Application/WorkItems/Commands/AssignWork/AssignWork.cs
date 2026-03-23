using backend.Application.Common.Interfaces;

namespace backend.Application.WorkItems.Commands.AssignWork;

public record AssignWorkCommand : IRequest<IStatusResult>
{
}

public class AssignWorkCommandValidator : AbstractValidator<AssignWorkCommand>
{
    public AssignWorkCommandValidator()
    {
    }
}

public class AssignWorkCommandHandler : IRequestHandler<AssignWorkCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public AssignWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(AssignWorkCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
