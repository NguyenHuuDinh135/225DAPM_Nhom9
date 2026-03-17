using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho loại cây xanh trong hệ thống.
/// Phân loại cây theo tên khoa học và nhóm cây.
/// </summary>
public class TreeType : BaseAuditableEntity
{
    /// <summary>
    /// Tên của loại cây.
    /// </summary>
    public string? Name { get; private set; }

    /// <summary>
    /// Nhóm cây mà loại này thuộc về (ví dụ: cây bóng mát, cây ăn quả).
    /// </summary>
    public string? Group { get; private set; }

    // Navigation properties
    /// <summary>
    /// Danh sách các cây xanh thuộc loại này.
    /// </summary>
    public ICollection<Tree> Trees { get; private set; } = new List<Tree>();
}
