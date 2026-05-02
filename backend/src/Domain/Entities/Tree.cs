
using backend.Domain.Exceptions;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một cây xanh cụ thể trong hệ thống quản lý.
/// Chứa thông tin về loại cây, tình trạng và kích thước.
/// </summary>
public class Tree : BaseAuditableEntity
{
    public int TreeTypeId { get;  set; }

    public string? Name { get;  set; }
    public string? Condition { get;  set; }

    public decimal? Height { get;  set; }
    public decimal? TrunkDiameter { get;  set; }
    public string? MainImageUrl { get; set; }
    public DateTime? RecordedDate { get;  set; }
    public DateTime? LastMaintenanceDate { get; private set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int RelocationCount { get; private set; }

    private const int MaxRelocations = 3;

    public TreeType TreeType { get;  set; } = null!;

    public ICollection<TreeLocationHistory> TreeLocationHistories { get;  set; } = new List<TreeLocationHistory>();
    public ICollection<TreeIncident> TreeIncidents { get;  set; } = new List<TreeIncident>();
    public ICollection<WorkDetail> WorkDetails { get;  set; } = new List<WorkDetail>();

    public void Relocate(double latitude, double longitude)
    {
        if (RelocationCount >= MaxRelocations)
            throw new TreeRelocationException("Quá giới hạn di dời.");
        Latitude = latitude;
        Longitude = longitude;
        RelocationCount++;
    }

    public bool NeedsMaintenance(DateTime now)
    {
        if (TreeType == null) return false;
        if (LastMaintenanceDate == null) return true;
        return (now - LastMaintenanceDate.Value).TotalDays >= TreeType.MaintenanceIntervalDays;
    }

    public void UpdateLastMaintenanceDate(DateTime date)
    {
        if (date > DateTime.UtcNow)
            throw new TreeMaintenanceException("LastMaintenanceDate cannot be in the future.");
        LastMaintenanceDate = date;
    }
}
