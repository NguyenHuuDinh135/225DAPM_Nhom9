
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một tuyến đường trong hệ thống quản lý cây xanh.
/// Tuyến đường thuộc về một phường và chứa các vị trí cụ thể.
/// </summary>
public class Street : BaseAuditableEntity
{
    public int WardId { get;  set; }

    public string? Name { get;  set; }

    public Ward Ward { get;  set; } = null!;
    public ICollection<Location> Locations { get;  set; } = new List<Location>();
}
