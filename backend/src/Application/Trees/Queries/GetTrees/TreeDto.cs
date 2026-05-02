namespace backend.Application.Trees.Queries.GetTrees;

public class TreeDto
{
    public int Id { get; set; }
    public string? Name { get; set; }
    public string? Condition { get; set; }
    public int TreeTypeId { get; set; }
    public string? TreeTypeName { get; set; }
    public DateTime? LastMaintenanceDate { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
