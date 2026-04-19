namespace backend.Domain.Enums;

/// <summary>
/// Trạng thái của sự cố cây xanh.
/// </summary>
public enum IncidentStatus
{
    /// <summary>
    /// Mới báo cáo.
    /// </summary>
    Reported = 0,

    /// <summary>
    /// Đang xử lý.
    /// </summary>
    InProgress = 1,

    /// <summary>
    /// Đã hoàn thành.
    /// </summary>
    Resolved = 2,

    /// <summary>
    /// Đã hủy.
    /// </summary>
    Cancelled = 3
}
