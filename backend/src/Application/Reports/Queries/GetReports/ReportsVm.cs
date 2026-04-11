namespace backend.Application.Reports.Queries.GetReports;

public class ReportsVm
{
    public IList<ReportDto> Reports { get; init; } = new List<ReportDto>();
}

public class ReportDto
{
    public int Id { get; init; }
    public string? Title { get; init; }
    public DateTime? CreatedAt { get; init; }
}
