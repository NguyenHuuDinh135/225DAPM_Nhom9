
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một tuyến đường trong hệ thống quản lý cây xanh.
/// Tuyến đường thuộc về một phường và chứa các vị trí cụ thể.
/// </summary>
public class Street : BaseAuditableEntity
{
    /// <summary>
    /// Tên của tuyến đường.
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Mã định danh của phường mà tuyến đường này thuộc về.
    /// </summary>
    public string WardId { get; private set; } = null!;

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến phường chứa tuyến đường này.
    /// </summary>
    public Ward Ward { get; private set; } = null!;

    /// <summary>
    /// Danh sách các vị trí cụ thể trên tuyến đường này.
    /// </summary>
    public ICollection<Location> Locations { get; private set; } = new List<Location>();
}
