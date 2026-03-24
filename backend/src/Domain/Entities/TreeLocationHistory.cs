using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại lịch sử vị trí của một cây xanh trong thời gian.
/// Theo dõi việc di chuyển hoặc thay đổi vị trí trồng cây.
/// </summary>
public class TreeLocationHistory : BaseAuditableEntity
{
    public int TreeId { get; private set; }
    public int LocationId { get; private set; }

    public DateTime FromDate { get; private set; }
    public DateTime? ToDate { get; private set; }

    public Tree Tree { get; private set; } = null!;
    public Location Location { get; private set; } = null!;
}
