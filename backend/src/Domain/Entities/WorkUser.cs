using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Liên kết giữa công việc và nhân viên được phân công.
/// Xác định vai trò và trạng thái tham gia của nhân viên trong công việc.
/// </summary>
public class WorkUser : BaseAuditableEntity
{
    public int WorkId { get;  set; }
    public string UserId { get;  set; } = null!;

    public string? Role { get;  set; }
    public string? Status { get;  set; }

    public Work Work { get;  set; } = null!;
}
