using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một kế hoạch chăm sóc và bảo dưỡng cây xanh.
/// Kế hoạch bao gồm nhiều công việc cụ thể trong một khoảng thời gian.
/// </summary>
public class Plan : BaseAuditableEntity
{
    public string? Name { get; private set; }

    public string CreatorId { get; private set; } = null!;
    public string? ApproverId { get; private set; }

    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    public string? Status { get; private set; }

    public ICollection<Work> Works { get; private set; } = new List<Work>();
}
