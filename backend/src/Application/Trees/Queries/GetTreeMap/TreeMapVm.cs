namespace backend.Application.Trees.Queries.GetTreeMap;

public class TreeMapVm
{
    public IList<TreeMapDto> Trees { get; init; } = [];
}

public class TreeMapDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
