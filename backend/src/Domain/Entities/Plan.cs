using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một kế hoạch chăm sóc và bảo dưỡng cây xanh.
/// Kế hoạch bao gồm nhiều công việc cụ thể trong một khoảng thời gian.
/// </summary>
public class Plan : BaseAuditableEntity
{
    /// <summary>
    /// Tên của kế hoạch.
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Mã định danh của người tạo kế hoạch.
    /// </summary>
    public string CreatorId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của người duyệt kế hoạch (nếu đã được duyệt).
    /// </summary>
    public string? ApproverId { get; private set; }

    /// <summary>
    /// Ngày tạo kế hoạch.
    /// </summary>
    public DateTime? CreatedDate { get; private set; }

    /// <summary>
    /// Ngày bắt đầu thực hiện kế hoạch.
    /// </summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>
    /// Ngày kết thúc kế hoạch.
    /// </summary>
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Trạng thái của kế hoạch (ví dụ: mới, đã duyệt, đang thực hiện).
    /// </summary>
    public string? Status { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến người tạo kế hoạch.
    /// </summary>
    public ApplicationUser Creator { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến người duyệt kế hoạch.
    /// </summary>
    public ApplicationUser? Approver { get; private set; }

    /// <summary>
    /// Danh sách các công việc thuộc kế hoạch này.
    /// </summary>
    public ICollection<Work> Works { get; private set; } = new List<Work>();
}
