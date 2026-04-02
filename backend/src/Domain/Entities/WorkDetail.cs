using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Chi tiết cụ thể của một công việc đối với một cây xanh.
/// Có thể bao gồm việc di chuyển cây hoặc thay thế cây mới.
/// </summary>
public class WorkDetail : BaseAuditableEntity
{
    public int WorkId { get;  set; }
    public int TreeId { get;  set; }

    public int? NewLocationId { get;  set; }
    public int? ReplacementTreeId { get;  set; }

    public string? Content { get;  set; }
    public string? Status { get;  set; }

    public Work Work { get;  set; } = null!;
    public Tree Tree { get;  set; } = null!;
    public Location? NewLocation { get;  set; }
    public Tree? ReplacementTree { get;  set; }
}
