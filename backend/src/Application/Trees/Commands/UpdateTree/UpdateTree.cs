using backend.Application.Common.Interfaces;

namespace backend.Application.Trees.Commands.UpdateTree;

public record UpdateTreeCommand : IRequest<IStatusResult>
{
}

public class UpdateTreeCommandValidator : AbstractValidator<UpdateTreeCommand>
{
    public UpdateTreeCommandValidator()
    {
    }
}

public class UpdateTreeCommandHandler : IRequestHandler<UpdateTreeCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateTreeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateTreeCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
