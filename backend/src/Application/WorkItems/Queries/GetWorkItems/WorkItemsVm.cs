namespace backend.Application.WorkItems.Queries.GetWorkItems;

public class WorkItemsVm
{
    public IList<WorkItemDto> WorkItems { get; init; } = new List<WorkItemDto>();
}

public class WorkItemDto
{
    public int Id { get; init; }
    public string? Title { get; init; }
    public string? Status { get; init; }
    public string? AssignedTo { get; init; }
}
