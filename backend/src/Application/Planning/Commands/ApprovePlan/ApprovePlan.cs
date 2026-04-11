using backend.Application.Common.Interfaces;

namespace backend.Application.Planning.Commands.ApprovePlan;

public record ApprovePlanCommand : IRequest<IStatusResult>
{
}

public class ApprovePlanCommandValidator : AbstractValidator<ApprovePlanCommand>
{
    public ApprovePlanCommandValidator()
    {
    }
}

public class ApprovePlanCommandHandler : IRequestHandler<ApprovePlanCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public ApprovePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(ApprovePlanCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
