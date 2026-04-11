namespace backend.Application.Incidents.Queries.GetIncidents;

public class IncidentsVm
{
    public IList<IncidentDto> Incidents { get; init; } = new List<IncidentDto>();
}

public class IncidentDto
{
    public int Id { get; init; }
    public int TreeId { get; init; }
    public string? Content { get; init; }
    public string? Status { get; init; }
    public DateTime? ReportedDate { get; init; }
}
