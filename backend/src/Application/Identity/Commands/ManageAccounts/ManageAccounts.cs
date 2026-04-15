using backend.Application.Common.Interfaces;

using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Identity.Commands.ManageAccounts;

public record ManageAccountsCommand : IRequest<IStatusResult>
{
}

public class ManageAccountsCommandValidator : AbstractValidator<ManageAccountsCommand>
{
    public ManageAccountsCommandValidator()
    {
    }
}

public class ManageAccountsCommandHandler : IRequestHandler<ManageAccountsCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public ManageAccountsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(ManageAccountsCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
