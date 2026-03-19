using backend.Domain.Common;
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một phường/xã trong hệ thống quản lý cây xanh.
/// Phường là đơn vị hành chính cơ sở chứa các tuyến đường và người dùng.
/// </summary>
public class Ward : BaseAuditableEntity
{
    /// <summary>
    /// Tên của phường.
    /// </summary>
    public string Name { get; private set; } = null!;

    // Navigation properties
    /// <summary>
    /// Danh sách các tuyến đường thuộc phường này.
    /// </summary>
    public ICollection<Street> Streets { get; private set; } = new List<Street>();

    /// <summary>
    /// Danh sách người dùng (nhân viên) thuộc phường này.
    /// </summary>
    public ICollection<ApplicationUser> Users { get; private set; } = new List<ApplicationUser>();
}
