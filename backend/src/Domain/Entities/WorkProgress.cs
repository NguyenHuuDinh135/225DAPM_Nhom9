using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại tiến độ cập nhật của một công việc.
/// Theo dõi tỷ lệ hoàn thành và ghi chú từ người cập nhật.
/// </summary>
public class WorkProgress : BaseAuditableEntity
{
    public int WorkId { get;  set; }
    public string UpdaterId { get;  set; } = null!;

    public int? Percentage { get;  set; }
    public string? Note { get;  set; }
    public DateTime? UpdatedDate { get;  set; }

    public Work Work { get;  set; } = null!;
}
