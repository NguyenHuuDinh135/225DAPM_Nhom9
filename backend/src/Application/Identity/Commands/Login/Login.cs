using backend.Application.Common.Interfaces;

namespace backend.Application.Identity.Commands.Login;

public record LoginCommand : IRequest<TokenDto>
{
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, TokenDto>
{
    private readonly IApplicationDbContext _context;

    public LoginCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TokenDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
