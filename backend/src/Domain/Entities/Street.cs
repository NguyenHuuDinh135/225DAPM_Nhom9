
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một tuyến đường trong hệ thống quản lý cây xanh.
/// Tuyến đường thuộc về một phường và chứa các vị trí cụ thể.
/// </summary>
public class Street : BaseAuditableEntity
{
    public int WardId { get; private set; }

    public string? Name { get; private set; }

    public Ward Ward { get; private set; } = null!;
    public ICollection<Location> Locations { get; private set; } = new List<Location>();
}
