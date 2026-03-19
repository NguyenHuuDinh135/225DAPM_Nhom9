namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một sự cố liên quan đến cây xanh.
/// Ghi nhận các vấn đề như cây bệnh, gãy đổ, hoặc cần bảo dưỡng.
/// </summary>
public class TreeIncident : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của cây xanh gặp sự cố.
    /// </summary>
    public int TreeId { get; private set; }

    /// <summary>
    /// Mã định danh của người báo cáo sự cố.
    /// </summary>
    public string ReporterId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của người duyệt sự cố (nếu đã được duyệt).
    /// </summary>
    public string? ApproverId { get; private set; }

    /// <summary>
    /// Mô tả chi tiết về sự cố.
    /// </summary>
    public string? Content { get; private set; }

    /// <summary>
    /// Trạng thái xử lý của sự cố (ví dụ: mới báo, đã duyệt, đang xử lý).
    /// </summary>
    public string? Status { get; private set; }

    /// <summary>
    /// Ngày báo cáo sự cố.
    /// </summary>
    public DateTime? ReportedDate { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến cây xanh gặp sự cố.
    /// </summary>
    public Tree Tree { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến người báo cáo sự cố.
    /// </summary>
    public ApplicationUser Reporter { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến người duyệt sự cố.
    /// </summary>
    public ApplicationUser? Approver { get; private set; }

    /// <summary>
    /// Danh sách hình ảnh minh họa cho sự cố.
    /// </summary>
    public ICollection<TreeIncidentImage> Images { get; private set; } = new List<TreeIncidentImage>();
}
