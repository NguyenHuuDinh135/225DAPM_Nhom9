using backend.Domain.Common;
using backend.Domain.Entities;

namespace backend.Domain.Events;

public class IncidentCreatedEvent(TreeIncident Incident) : BaseEvent
{
    public TreeIncident Incident { get; } = Incident;
}
