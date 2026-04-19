using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho loại cây xanh trong hệ thống.
/// Phân loại cây theo tên khoa học và nhóm cây.
/// </summary>
public class TreeType : BaseAuditableEntity
{
    public string? Name { get;  set; }
    public string? Group { get;  set; }
    public int MaintenanceIntervalDays { get; set; } = 90;

    public ICollection<Tree> Trees { get;  set; } = new List<Tree>();
}
