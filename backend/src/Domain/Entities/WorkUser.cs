using backend.Domain.Common;
namespace backend.Domain.Entities;

/// <summary>
/// Liên kết giữa công việc và nhân viên được phân công.
/// Xác định vai trò và trạng thái tham gia của nhân viên trong công việc.
/// </summary>
public class WorkUser : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của công việc.
    /// </summary>
    public int WorkId { get; private set; }

    /// <summary>
    /// Mã định danh của nhân viên được phân công.
    /// </summary>
    public string UserId { get; private set; } = null!;

    /// <summary>
    /// Vai trò của nhân viên trong công việc (ví dụ: trưởng nhóm, thành viên).
    /// </summary>
    public string? Role { get; private set; }

    /// <summary>
    /// Trạng thái tham gia của nhân viên (ví dụ: đã nhận, đang làm, hoàn thành).
    /// </summary>
    public string? Status { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến công việc.
    /// </summary>
    public Work Work { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến nhân viên.
    /// </summary>
    public ApplicationUser User { get; private set; } = null!;
}
