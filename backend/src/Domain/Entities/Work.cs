using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một công việc cụ thể trong kế hoạch chăm sóc cây xanh.
/// Công việc được giao cho nhân viên thực hiện và theo dõi tiến độ.
/// </summary>
public class Work : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của loại công việc.
    /// </summary>
    public int WorkTypeId { get; private set; }

    /// <summary>
    /// Mã định danh của người tạo công việc.
    /// </summary>
    public string CreatorId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của kế hoạch mà công việc này thuộc về.
    /// </summary>
    public int PlanId { get; private set; }

    /// <summary>
    /// Ngày tạo công việc.
    /// </summary>
    public DateTime? CreatedDate { get; private set; }

    /// <summary>
    /// Ngày bắt đầu thực hiện công việc.
    /// </summary>
    public DateTime? StartDate { get; private set; }

    /// <summary>
    /// Ngày kết thúc công việc.
    /// </summary>
    public DateTime? EndDate { get; private set; }

    /// <summary>
    /// Trạng thái hiện tại của công việc.
    /// </summary>
    public WorkStatus Status { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến loại công việc.
    /// </summary>
    public WorkType WorkType { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến người tạo công việc.
    /// </summary>
    public ApplicationUser Creator { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến kế hoạch chứa công việc này.
    /// </summary>
    public Plan Plan { get; private set; } = null!;

    /// <summary>
    /// Chi tiết các nhiệm vụ cụ thể trong công việc.
    /// </summary>
    public ICollection<WorkDetail> WorkDetails { get; private set; } = new List<WorkDetail>();

    /// <summary>
    /// Danh sách nhân viên được phân công cho công việc này.
    /// </summary>
    public ICollection<WorkUser> WorkUsers { get; private set; } = new List<WorkUser>();

    /// <summary>
    /// Lịch sử cập nhật tiến độ của công việc.
    /// </summary>
    public ICollection<WorkProgress> WorkProgresses { get; private set; } = new List<WorkProgress>();
}
