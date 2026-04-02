namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một sự cố liên quan đến cây xanh.
/// Ghi nhận các vấn đề như cây bệnh, gãy đổ, hoặc cần bảo dưỡng.
/// </summary>
public class TreeIncident : BaseAuditableEntity
{
    public int TreeId { get;  set; }

    public string ReporterId { get;  set; } = null!;
    public string? ApproverId { get;  set; }

    public string? Content { get;  set; }
    public string? Status { get;  set; }
    public DateTime? ReportedDate { get;  set; }

    public Tree Tree { get;  set; } = null!;
    public ICollection<TreeIncidentImage> Images { get;  set; } = new List<TreeIncidentImage>();
}
