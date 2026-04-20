using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.TreeIncidents.Commands.SendIncidentFeedback;

public record SendIncidentFeedbackCommand : IRequest<IStatusResult>
{
    public int IncidentId { get; init; }
    public string Feedback { get; init; } = null!;
    public string ApproverId { get; init; } = null!;
    public bool IsResolved { get; init; }
}

public class SendIncidentFeedbackCommandValidator : AbstractValidator<SendIncidentFeedbackCommand>
{
    public SendIncidentFeedbackCommandValidator()
    {
        RuleFor(x => x.IncidentId).GreaterThan(0);
        RuleFor(x => x.Feedback).NotEmpty();
        RuleFor(x => x.ApproverId).NotEmpty();
    }
}

public class SendIncidentFeedbackCommandHandler : IRequestHandler<SendIncidentFeedbackCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public SendIncidentFeedbackCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<IStatusResult> Handle(SendIncidentFeedbackCommand request, CancellationToken cancellationToken)
    {
        var incident = await _context.TreeIncidents
            .FindAsync([request.IncidentId], cancellationToken);

        if (incident is null)
            return StatusResult.Failure($"TreeIncident {request.IncidentId} not found.");

        if (request.IsResolved)
            incident.Approve(request.ApproverId);
        else
            incident.UpdateStatus("InProgress");

        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.SendIncidentNotificationAsync(
            $"Sự cố #{incident.Id} đã được phản hồi: {request.Feedback}", incident.Id);

        return StatusResult.Success();
    }
}
