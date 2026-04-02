
namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một vị trí địa lý cụ thể trong hệ thống quản lý cây xanh.
/// Vị trí được xác định bởi tuyến đường, số nhà và tọa độ GPS.
/// </summary>
public class Location : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của tuyến đường chứa vị trí này.
    /// </summary>
    public int StreetId { get;  set; }

    /// <summary>
    /// Số nhà tại vị trí này (nếu có).
    /// </summary>
    public int? HouseNumber { get;  set; }

    /// <summary>
    /// Kinh độ của vị trí (tọa độ GPS).
    /// </summary>
    public decimal? Longitude { get;  set; }

    /// <summary>
    /// Vĩ độ của vị trí (tọa độ GPS).
    /// </summary>
    public decimal? Latitude { get;  set; }

    /// <summary>
    /// Mô tả chi tiết về vị trí này.
    /// </summary>
    public string? Description { get;  set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến tuyến đường chứa vị trí này.
    /// </summary>
    public Street Street { get;  set; } = null!;

    /// <summary>
    /// Lịch sử vị trí của các cây xanh tại địa điểm này.
    /// </summary>
    public ICollection<TreeLocationHistory> TreeLocationHistories { get;  set; } = new List<TreeLocationHistory>();

    /// <summary>
    /// Chi tiết công việc liên quan đến vị trí này.
    /// </summary>
    public ICollection<WorkDetail> WorkDetails { get;  set; } = new List<WorkDetail>();
}
