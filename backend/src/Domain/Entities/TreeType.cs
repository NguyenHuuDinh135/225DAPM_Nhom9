using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho loại cây xanh trong hệ thống.
/// Phân loại cây theo tên khoa học và nhóm cây.
/// </summary>
public class TreeType : BaseAuditableEntity
{
    public string? Name { get; private set; }
    public string? Group { get; private set; }

    public ICollection<Tree> Trees { get; private set; } = new List<Tree>();
}
