namespace backend.Application.Progress.Queries.TrackProgress;

public class ProgressVm
{
    public IList<ProgressDto> Items { get; init; } = new List<ProgressDto>();
}

public class ProgressDto
{
    public int Id { get; init; }
    public string? Status { get; init; }
    public int PercentComplete { get; init; }
}
