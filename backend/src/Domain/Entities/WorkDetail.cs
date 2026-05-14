using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Chi tiết cụ thể của một công việc đối với một cây xanh.
/// Có thể bao gồm việc di chuyển cây hoặc thay thế cây mới.
/// </summary>
public class WorkDetail : BaseAuditableEntity
{
    public int WorkId { get; private set; }
    public int TreeId { get; private set; }

    public int? NewLocationId { get; private set; }
    public int? ReplacementTreeId { get; private set; }

    public string? Content { get; private set; }
    public string? Status { get; private set; }

    public Work Work { get; private set; } = null!;
    public Tree Tree { get; private set; } = null!;
    public Location? NewLocation { get; private set; }
    public Tree? ReplacementTree { get; private set; }

    private WorkDetail() { }

    public static WorkDetail Create(int workId, int treeId, string? status = "New") =>
        new() { WorkId = workId, TreeId = treeId, Status = status };

    public static WorkDetail Create(int workId, int treeId, string? content, string? status) =>
        new() { WorkId = workId, TreeId = treeId, Content = content, Status = status };

    public static WorkDetail CreateWithWork(Work work, int treeId, string? content = null, string? status = "New") =>
        new() { Work = work, TreeId = treeId, Content = content, Status = status };
}
