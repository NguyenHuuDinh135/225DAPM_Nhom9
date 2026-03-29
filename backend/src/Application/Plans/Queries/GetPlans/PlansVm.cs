namespace backend.Application.Plans.Queries.GetPlans;

public class PlansVm
{
    public IList<PlanDto> Plans { get; init; } = new List<PlanDto>();
}

public class PlanDto
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string CreatorId { get; init; } = null!;
    public string? ApproverId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Status { get; init; }
    public int WorkCount { get; init; }
}
