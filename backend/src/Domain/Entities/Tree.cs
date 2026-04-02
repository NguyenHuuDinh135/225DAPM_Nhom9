
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một cây xanh cụ thể trong hệ thống quản lý.
/// Chứa thông tin về loại cây, tình trạng và kích thước.
/// </summary>
public class Tree : BaseAuditableEntity
{
    public int TreeTypeId { get;  set; }

    public string? Name { get;  set; }
    public string? Condition { get;  set; }

    public decimal? Height { get;  set; }
    public decimal? TrunkDiameter { get;  set; }
    public DateTime? RecordedDate { get;  set; }

    public TreeType TreeType { get;  set; } = null!;

    public ICollection<TreeLocationHistory> TreeLocationHistories { get;  set; } = new List<TreeLocationHistory>();
    public ICollection<TreeIncident> TreeIncidents { get;  set; } = new List<TreeIncident>();
    public ICollection<WorkDetail> WorkDetails { get;  set; } = new List<WorkDetail>();
}
