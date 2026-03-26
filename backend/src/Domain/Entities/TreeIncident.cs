namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một sự cố liên quan đến cây xanh.
/// Ghi nhận các vấn đề như cây bệnh, gãy đổ, hoặc cần bảo dưỡng.
/// </summary>
public class TreeIncident : BaseAuditableEntity
{
    public int TreeId { get; private set; }

    public string ReporterId { get; private set; } = null!;
    public string? ApproverId { get; private set; }

    public string? Content { get; private set; }
    public string? Status { get; private set; }
    public DateTime? ReportedDate { get; private set; }

    public Tree Tree { get; private set; } = null!;
    public ICollection<TreeIncidentImage> Images { get; private set; } = new List<TreeIncidentImage>();
}
