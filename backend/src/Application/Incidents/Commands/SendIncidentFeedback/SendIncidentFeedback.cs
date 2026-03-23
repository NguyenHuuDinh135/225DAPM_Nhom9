using backend.Application.Common.Interfaces;

namespace backend.Application.Incidents.Commands.SendIncidentFeedback;

public record SendIncidentFeedbackCommand : IRequest<IStatusResult>
{
}

public class SendIncidentFeedbackCommandValidator : AbstractValidator<SendIncidentFeedbackCommand>
{
    public SendIncidentFeedbackCommandValidator()
    {
    }
}

public class SendIncidentFeedbackCommandHandler : IRequestHandler<SendIncidentFeedbackCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public SendIncidentFeedbackCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(SendIncidentFeedbackCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
