namespace backend.Domain.Entities;

public class TreeIncident : BaseAuditableEntity
{
    public int TreeId { get; private set; }
    public string ReporterId { get; private set; } = null!;
    public string? ApproverId { get; private set; }
    public string? Content { get; private set; }
    public string? Status { get; private set; }
    public DateTime? ReportedDate { get; private set; }

    public Tree Tree { get; private set; } = null!;
    public ICollection<TreeIncidentImage> Images { get; private set; } = new List<TreeIncidentImage>();

    private TreeIncident() { }

    public static TreeIncident Create(int treeId, string reporterId, string? content)
    {
        return new TreeIncident
        {
            TreeId = treeId,
            ReporterId = reporterId,
            Content = content,
            Status = "Pending",
            ReportedDate = DateTime.UtcNow
        };
    }

    public void AddImage(TreeIncidentImage image) => Images.Add(image);

    public void UpdateStatus(string status) => Status = status;

    public void Approve(string approverId)
    {
        ApproverId = approverId;
        Status = "Approved";
    }
}
