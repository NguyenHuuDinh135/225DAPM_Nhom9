using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Lưu trữ hình ảnh minh họa cho một sự cố cây xanh.
/// Hỗ trợ việc ghi nhận và theo dõi tình trạng cây bằng hình ảnh.
/// </summary>
public class TreeIncidentImage : BaseAuditableEntity
{
    public int TreeIncidentId { get;  set; }

    public string? Path { get;  set; }
    public string? Description { get;  set; }

    public TreeIncident TreeIncident { get;  set; } = null!;
}
