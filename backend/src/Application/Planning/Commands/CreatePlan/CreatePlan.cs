using backend.Application.Common.Interfaces;

namespace backend.Application.Planning.Commands.CreatePlan;

public record CreatePlanCommand : IRequest<int>
{
}

public class CreatePlanCommandValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
    }
}

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreatePlanCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreatePlanCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
