using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Lưu trữ hình ảnh minh họa cho một sự cố cây xanh.
/// Hỗ trợ việc ghi nhận và theo dõi tình trạng cây bằng hình ảnh.
/// </summary>
public class TreeIncidentImage : BaseAuditableEntity
{
    public int TreeIncidentId { get; private set; }

    public string? Path { get; private set; }
    public string? Description { get; private set; }

    public TreeIncident TreeIncident { get; private set; } = null!;
}
