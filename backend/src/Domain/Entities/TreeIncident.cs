namespace backend.Domain.Entities;

public class TreeIncident : BaseAuditableEntity
{
    public int TreeId { get; private set; }
    public string? ReporterId { get; private set; }
    public string? ReporterName { get; private set; }
    public string? ReporterPhone { get; private set; }
    public string? ApproverId { get; private set; }
    public string? AssignedTeamId { get; private set; }
    public string? Content { get; private set; }
    public string? Status { get; private set; }
    public string? Severity { get; private set; }
    public DateTime? ReportedDate { get; private set; }

    public Tree Tree { get; private set; } = null!;
    public ICollection<TreeIncidentImage> Images { get; private set; } = new List<TreeIncidentImage>();

    private TreeIncident() { }

    public static TreeIncident Create(int treeId, string? reporterId, string? content,
        string? reporterName = null, string? reporterPhone = null, string? severity = "Bình thường") =>
        new TreeIncident
        {
            TreeId = treeId,
            ReporterId = reporterId,
            ReporterName = reporterName,
            ReporterPhone = reporterPhone,
            Content = content,
            Status = "Pending",
            Severity = severity,
            ReportedDate = DateTime.UtcNow
        };

    public void AddImage(TreeIncidentImage image) => Images.Add(image);

    public void UpdateStatus(string status) => Status = status;

    public void Approve(string approverId, string? teamId = null)
    {
        ApproverId = approverId;
        AssignedTeamId = teamId;
        Status = "Approved";
    }
}
