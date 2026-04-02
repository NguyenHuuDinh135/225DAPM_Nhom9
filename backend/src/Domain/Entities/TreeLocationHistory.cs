using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Ghi lại lịch sử vị trí của một cây xanh trong thời gian.
/// Theo dõi việc di chuyển hoặc thay đổi vị trí trồng cây.
/// </summary>
public class TreeLocationHistory : BaseAuditableEntity
{
    public int TreeId { get;  set; }
    public int LocationId { get;  set; }

    public DateTime FromDate { get;  set; }
    public DateTime? ToDate { get;  set; }

    public Tree Tree { get;  set; } = null!;
    public Location Location { get;  set; } = null!;
}
