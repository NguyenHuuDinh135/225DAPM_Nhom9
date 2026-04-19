namespace backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;

/// <summary>
/// DTO cho chi tiết sự cố cây xanh.
/// </summary>
public class TreeIncidentDetailDto
{
    public int Id { get; set; }
    public int TreeId { get; set; }
    public string? TreeName { get; set; }
    public string? Description { get; set; }
    public Domain.Enums.IncidentStatus Status { get; set; }
    public DateTime ReportedDate { get; set; }
    public string? ReportedBy { get; set; }
    public DateTime? ResolvedDate { get; set; }
    public string? Resolution { get; set; }
    public List<string>? Images { get; set; }
}
