using backend.Domain.Common;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một kế hoạch chăm sóc và bảo dưỡng cây xanh.
/// Kế hoạch bao gồm nhiều công việc cụ thể trong một khoảng thời gian.
/// </summary>
public class Plan : BaseAuditableEntity
{
    private Plan() { } // EF Core

    public Plan(string name, string creatorId, DateTime? startDate, DateTime? endDate)
    {
        Name = name;
        CreatorId = creatorId;
        StartDate = startDate;
        EndDate = endDate;
        Status = "Draft";
        CreatedDate = DateTime.UtcNow;
    }

    public string? Name { get; private set; }

    public string CreatorId { get; private set; } = null!;
    public string? ApproverId { get; private set; }

    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    public string? Status { get; private set; }

    public ICollection<Work> Works { get; private set; } = new List<Work>();

    public void Update(string name, DateTime? startDate, DateTime? endDate, string status)
    {
        Name = name;
        StartDate = startDate;
        EndDate = endDate;
        Status = status;
    }

    public void Approve(string approverId)
    {
        ApproverId = approverId;
        Status = "Approved";
    }
}
