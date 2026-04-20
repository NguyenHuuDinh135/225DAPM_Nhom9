namespace backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;

public class TreeIncidentDetailDto
{
    public int Id { get; set; }
    public int TreeId { get; set; }
    public string? TreeName { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateTime ReportedDate { get; set; }
    public string? ReportedBy { get; set; }
    public List<string> Images { get; set; } = [];
}
