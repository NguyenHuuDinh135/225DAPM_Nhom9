using backend.Application.Common.Interfaces;

namespace backend.Application.Incidents.Commands.CreateIncident;

public record CreateIncidentCommand : IRequest<int>
{
}

public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentCommandValidator()
    {
    }
}

public class CreateIncidentCommandHandler : IRequestHandler<CreateIncidentCommand, int>
{
    private readonly IApplicationDbContext _context;

    public CreateIncidentCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
