using backend.Application.Common.Interfaces;

using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Progress.Commands.ApproveProgress;

public record ApproveProgressCommand : IRequest<IStatusResult>
{
}

public class ApproveProgressCommandValidator : AbstractValidator<ApproveProgressCommand>
{
    public ApproveProgressCommandValidator()
    {
    }
}

public class ApproveProgressCommandHandler : IRequestHandler<ApproveProgressCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public ApproveProgressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(ApproveProgressCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
