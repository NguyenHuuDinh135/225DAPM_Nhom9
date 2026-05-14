using backend.Domain.Common;
using backend.Domain.Entities;

namespace backend.Domain.Events;

public class PlanApprovedEvent(Plan Plan) : BaseEvent
{
    public Plan Plan { get; } = Plan;
}
