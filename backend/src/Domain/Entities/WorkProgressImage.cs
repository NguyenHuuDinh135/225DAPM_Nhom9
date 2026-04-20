using backend.Domain.Common;

namespace backend.Domain.Entities;

public class WorkProgressImage : BaseAuditableEntity
{
    public int WorkProgressId { get; set; }
    public string Path { get; set; } = null!;

    public WorkProgress WorkProgress { get; set; } = null!;
}
