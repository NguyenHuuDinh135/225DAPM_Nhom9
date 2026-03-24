using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một phường/xã trong hệ thống quản lý cây xanh.
/// Phường là đơn vị hành chính cơ sở chứa các tuyến đường và người dùng.
/// </summary>
public class Ward : BaseAuditableEntity
{
    public string Name { get; private set; } = null!;

    public ICollection<Street> Streets { get; private set; } = new List<Street>();
}
