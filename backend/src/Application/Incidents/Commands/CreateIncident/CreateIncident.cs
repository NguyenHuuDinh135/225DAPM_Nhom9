using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Incidents.Commands.CreateIncident;

public record CreateIncidentCommand : IRequest<int>
{
    public int TreeId { get; init; }
    public string ReporterId { get; init; } = null!;
    public string? Content { get; init; }
}

public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentCommandValidator()
    {
    }
}

public class CreateIncidentCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    : IRequestHandler<CreateIncidentCommand, int>
{
    public async Task<int> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = TreeIncident.Create(request.TreeId, request.ReporterId, request.Content);

        context.TreeIncidents.Add(incident);
        await context.SaveChangesAsync(cancellationToken);

        await notificationService.SendIncidentNotificationAsync("Có sự cố mới được báo cáo!", incident.Id);

        return incident.Id;
    }
}
