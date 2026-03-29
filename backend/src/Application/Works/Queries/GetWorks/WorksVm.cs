namespace backend.Application.Works.Queries.GetWorks;

public class WorksVm
{
    public IList<WorkDto> Works { get; init; } = new List<WorkDto>();
}

public class WorkDto
{
    public int Id { get; init; }
    public int WorkTypeId { get; init; }
    public string? WorkTypeName { get; init; }
    public int PlanId { get; init; }
    public string CreatorId { get; init; } = null!;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string Status { get; init; } = null!;
}
