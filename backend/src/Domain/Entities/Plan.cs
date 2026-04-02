using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một kế hoạch chăm sóc và bảo dưỡng cây xanh.
/// Kế hoạch bao gồm nhiều công việc cụ thể trong một khoảng thời gian.
/// </summary>
public class Plan : BaseAuditableEntity
{
    public string? Name { get;  set; }

    public string CreatorId { get;  set; } = null!;
    public string? ApproverId { get;  set; }

    public DateTime? CreatedDate { get;  set; }
    public DateTime? StartDate { get;  set; }
    public DateTime? EndDate { get;  set; }

    public string? Status { get;  set; }

    public ICollection<Work> Works { get;  set; } = new List<Work>();
}
