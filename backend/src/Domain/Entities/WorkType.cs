using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Phân loại các loại công việc trong hệ thống quản lý cây xanh.
/// Ví dụ: cắt tỉa, bón phân, thay thế cây.
/// </summary>
public class WorkType : BaseAuditableEntity
{
    /// <summary>
    /// Tên của loại công việc.
    /// </summary>
    public string? Name { get; private set; }

    // Navigation properties
    /// <summary>
    /// Danh sách các công việc thuộc loại này.
    /// </summary>
    public ICollection<Work> Works { get; private set; } = new List<Work>();
}
