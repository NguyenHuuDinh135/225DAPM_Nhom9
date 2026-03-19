using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Lưu trữ hình ảnh minh họa cho một sự cố cây xanh.
/// Hỗ trợ việc ghi nhận và theo dõi tình trạng cây bằng hình ảnh.
/// </summary>
public class TreeIncidentImage : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của sự cố mà hình ảnh này thuộc về.
    /// </summary>
    public int TreeIncidentId { get; private set; }

    /// <summary>
    /// Đường dẫn đến file hình ảnh.
    /// </summary>
    public string? Path { get; private set; }

    /// <summary>
    /// Mô tả về nội dung của hình ảnh.
    /// </summary>
    public string? Description { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến sự cố cây xanh.
    /// </summary>
    public TreeIncident TreeIncident { get; private set; } = null!;
}
