using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Chi tiết cụ thể của một công việc đối với một cây xanh.
/// Có thể bao gồm việc di chuyển cây hoặc thay thế cây mới.
/// </summary>
public class WorkDetail : BaseAuditableEntity
{
    /// <summary>
    /// Mã định danh của công việc mà chi tiết này thuộc về.
    /// </summary>
    public string WorkId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của cây xanh cần thực hiện công việc.
    /// </summary>
    public string TreeId { get; private set; } = null!;

    /// <summary>
    /// Mã định danh của vị trí mới (nếu công việc bao gồm di chuyển cây).
    /// </summary>
    public string? NewLocationId { get; private set; }

    /// <summary>
    /// Mã định danh của cây thay thế (nếu công việc bao gồm thay cây).
    /// </summary>
    public string? ReplacementTreeId { get; private set; }

    /// <summary>
    /// Mô tả chi tiết về công việc cần thực hiện.
    /// </summary>
    public string? Content { get; private set; }

    /// <summary>
    /// Trạng thái thực hiện của chi tiết công việc.
    /// </summary>
    public string? Status { get; private set; }

    // Navigation properties
    /// <summary>
    /// Tham chiếu đến công việc chính.
    /// </summary>
    public Work Work { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến cây xanh cần xử lý.
    /// </summary>
    public Tree Tree { get; private set; } = null!;

    /// <summary>
    /// Tham chiếu đến vị trí mới (nếu có).
    /// </summary>
    public Location? NewLocation { get; private set; }

    /// <summary>
    /// Tham chiếu đến cây thay thế (nếu có).
    /// </summary>
    public Tree? ReplacementTree { get; private set; }
}
