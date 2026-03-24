using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Phân loại các loại công việc trong hệ thống quản lý cây xanh.
/// Ví dụ: cắt tỉa, bón phân, thay thế cây.
/// </summary>
public class WorkType : BaseAuditableEntity
{
    public string? Name { get; private set; }

    public ICollection<Work> Works { get; private set; } = new List<Work>();
}
