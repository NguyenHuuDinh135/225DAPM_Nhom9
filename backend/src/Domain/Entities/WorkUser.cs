using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Liên kết giữa công việc và nhân viên được phân công.
/// Xác định vai trò và trạng thái tham gia của nhân viên trong công việc.
/// </summary>
public class WorkUser : BaseAuditableEntity
{
    public int WorkId { get; private set; }
    public string UserId { get; private set; } = null!;

    public string? Role { get; private set; }
    public string? Status { get; private set; }

    public Work Work { get; private set; } = null!;
}
