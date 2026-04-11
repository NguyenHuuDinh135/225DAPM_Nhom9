using backend.Domain.Enums;

namespace backend.Application.Works.Queries.GetWorks;

public class WorkDto
{
    public int Id { get; init; }
    public int WorkTypeId { get; init; }
    public string? WorkTypeName { get; init; }
    public int PlanId { get; init; }
    public string? PlanName { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public WorkStatus Status { get; init; }
    public string StatusName => Status.ToString();
}
