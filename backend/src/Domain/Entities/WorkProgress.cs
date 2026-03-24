using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại tiến độ cập nhật của một công việc.
/// Theo dõi tỷ lệ hoàn thành và ghi chú từ người cập nhật.
/// </summary>
public class WorkProgress : BaseAuditableEntity
{
    public int WorkId { get; private set; }
    public string UpdaterId { get; private set; } = null!;

    public int? Percentage { get; private set; }
    public string? Note { get; private set; }
    public DateTime? UpdatedDate { get; private set; }

    public Work Work { get; private set; } = null!;
}
