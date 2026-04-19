using backend.Application.TreeIncidents.Queries.GetIncidentsByLocation;

namespace backend.Application.TreeIncidents.Queries.GetTreeIncidents;

/// <summary>
/// ViewModel cho danh sách sự cố cây xanh.
/// </summary>
public class TreeIncidentsVm
{
    public IReadOnlyCollection<TreeIncidentDto> TreeIncidents { get; set; } = Array.Empty<TreeIncidentDto>();
}
