
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một cây xanh cụ thể trong hệ thống quản lý.
/// Chứa thông tin về loại cây, tình trạng và kích thước.
/// </summary>
public class Tree : BaseAuditableEntity
{
    public int TreeTypeId { get; private set; }

    public string? Name { get; private set; }
    public string? Condition { get; private set; }

    public decimal? Height { get; private set; }
    public decimal? TrunkDiameter { get; private set; }
    public DateTime? RecordedDate { get; private set; }

    public TreeType TreeType { get; private set; } = null!;

    public ICollection<TreeLocationHistory> TreeLocationHistories { get; private set; } = new List<TreeLocationHistory>();
    public ICollection<TreeIncident> TreeIncidents { get; private set; } = new List<TreeIncident>();
    public ICollection<WorkDetail> WorkDetails { get; private set; } = new List<WorkDetail>();
}
