using backend.Domain.Common;
using backend.Domain.Entities;

namespace backend.Domain.Events;

public class WorkCompletedEvent(Work Work) : BaseEvent
{
    public Work Work { get; } = Work;
}
