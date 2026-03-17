
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một cây xanh cụ thể trong hệ thống quản lý.
/// Chứa thông tin về loại cây, tình trạng và kích thước.
/// </summary>
public class Tree : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của loại cây mà cây này thuộc về.
    /// </summary>
    public string TreeTypeId { get; private set; } = null!;

    /// <summary>
    /// Tên riêng của cây (nếu có).
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Tình trạng sức khỏe của cây (ví dụ: tốt, bệnh, chết).
    /// </summary>
    public string? Condition { get; private set; }

    /// <summary>
    /// Chiều cao của cây (đơn vị: mét).
    /// </summary>
    public decimal? Height { get; private set; }

    /// <summary>
    /// Đường kính thân cây (đơn vị: cm).
    /// </summary>
    public decimal? TrunkDiameter { get; private set; }

    /// <summary>
    /// Ngày ghi nhận thông tin cây lần đầu.
    /// </summary>
    public DateTime? RecordedDate { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến loại cây của cây này.
    /// </summary>
    public TreeType TreeType { get; private set; } = null!;

    /// <summary>
    /// Lịch sử các vị trí mà cây này đã được trồng.
    /// </summary>
    public ICollection<TreeLocationHistory> TreeLocationHistories { get; private set; } = new List<TreeLocationHistory>();

    /// <summary>
    /// Danh sách các sự cố liên quan đến cây này.
    /// </summary>
    public ICollection<TreeIncident> TreeIncidents { get; private set; } = new List<TreeIncident>();

    /// <summary>
    /// Chi tiết các công việc bảo dưỡng hoặc xử lý cây này.
    /// </summary>
    public ICollection<WorkDetail> WorkDetails { get; private set; } = new List<WorkDetail>();
}
