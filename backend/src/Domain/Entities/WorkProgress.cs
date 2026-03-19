using backend.Domain.Common;
namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại tiến độ cập nhật của một công việc.
/// Theo dõi tỷ lệ hoàn thành và ghi chú từ người cập nhật.
/// </summary>
public class WorkProgress : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của công việc được cập nhật tiến độ.
    /// </summary>
    public int WorkId { get; private set; }

    /// <summary>
    /// Mã định danh của người cập nhật tiến độ.
    /// </summary>
    public string UpdaterId { get; private set; } = null!;

    /// <summary>
    /// Tỷ lệ hoàn thành công việc (từ 0 đến 100).
    /// </summary>
    public int? Percentage { get; private set; }

    /// <summary>
    /// Ghi chú về tình trạng công việc hoặc vấn đề gặp phải.
    /// </summary>
    public string? Note { get; private set; }

    /// <summary>
    /// Ngày giờ cập nhật tiến độ.
    /// </summary>
    public DateTime? UpdatedDate { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến công việc.
    /// </summary>
    public Work Work { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến người cập nhật.
    /// </summary>
    public ApplicationUser Updater { get; private set; } = null!;
}
