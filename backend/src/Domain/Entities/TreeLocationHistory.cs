using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại lịch sử vị trí của một cây xanh trong thời gian.
/// Theo dõi việc di chuyển hoặc thay đổi vị trí trồng cây.
/// </summary>
public class TreeLocationHistory : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của cây xanh.
    /// </summary>
    public string TreeId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của vị trí mà cây được trồng.
    /// </summary>
    public string LocationId { get; private set; } = null!;

    /// <summary>
    /// Ngày bắt đầu cây ở vị trí này.
    /// </summary>
    public DateTime FromDate { get; private set; }

    /// <summary>
    /// Ngày kết thúc cây ở vị trí này (null nếu vẫn đang ở đó).
    /// </summary>
    public DateTime? ToDate { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến cây xanh.
    /// </summary>
    public Tree Tree { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến vị trí địa lý.
    /// </summary>
    public Location Location { get; private set; } = null!;
}
