using backend.Domain.Common;

namespace backend.Domain.Entities;

public class Plan : BaseAuditableEntity
{
    public string? Name { get; private set; }
    public string CreatorId { get; private set; } = null!;
    public string? ApproverId { get; private set; }
    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public string? Status { get; private set; }

    public ICollection<Work> Works { get; set; } = new List<Work>();

    private Plan() { }

    public static Plan Create(string name, string creatorId, DateTime? startDate, DateTime? endDate) =>
        new Plan
        {
            Name = name,
            CreatorId = creatorId,
            StartDate = startDate,
            EndDate = endDate,
            CreatedDate = DateTime.UtcNow,
            Status = "Draft"
        };

    public void Update(string? name, DateTime? startDate, DateTime? endDate)
    {
        Name = name;
        StartDate = startDate;
        EndDate = endDate;
    }

    public void Approve(string approverId)
    {
        ApproverId = approverId;
        Status = "Approved";
    }
}
