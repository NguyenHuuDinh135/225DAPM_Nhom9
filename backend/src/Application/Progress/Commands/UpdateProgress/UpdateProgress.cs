using backend.Application.Common.Interfaces;

using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Progress.Commands.UpdateProgress;

public record UpdateProgressCommand : IRequest<IStatusResult>
{
}

public class UpdateProgressCommandValidator : AbstractValidator<UpdateProgressCommand>
{
    public UpdateProgressCommandValidator()
    {
    }
}

public class UpdateProgressCommandHandler : IRequestHandler<UpdateProgressCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateProgressCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateProgressCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
