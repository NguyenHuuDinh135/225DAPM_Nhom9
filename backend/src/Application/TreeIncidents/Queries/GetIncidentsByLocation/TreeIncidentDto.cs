namespace backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

public class TreeIncidentDto
{
    public int Id { get; set; }
    public int TreeId { get; set; }
    public string? TreeName { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public DateTime ReportedDate { get; set; }
    public string? ReportedBy { get; set; }
}
