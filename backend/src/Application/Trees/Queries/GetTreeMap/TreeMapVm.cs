namespace backend.Application.Trees.Queries.GetTreeMap;

public class TreeMapVm
{
    public IList<TreeMapDto> Trees { get; init; } = new List<TreeMapDto>();
}

public class TreeMapDto
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Condition { get; init; }
    public string? TreeTypeName { get; init; }
    public double? Latitude { get; init; }
    public double? Longitude { get; init; }
}
