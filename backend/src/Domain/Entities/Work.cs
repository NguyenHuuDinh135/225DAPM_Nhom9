using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Work : BaseAuditableEntity
{
    public int WorkTypeId { get; private set; }
    public string CreatorId { get; private set; } = null!;
    public int PlanId { get; private set; }
    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public WorkStatus Status { get; private set; }
    public string? RejectionFeedback { get; private set; }

    public WorkType WorkType { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
    public ICollection<WorkDetail> WorkDetails { get; set; } = new List<WorkDetail>();
    public ICollection<WorkUser> WorkUsers { get; set; } = new List<WorkUser>();
    public ICollection<WorkProgress> WorkProgresses { get; set; } = new List<WorkProgress>();

    private Work() { }

    public static Work Create(int workTypeId, int planId, string creatorId, DateTime? startDate, DateTime? endDate) =>
        new Work
        {
            WorkTypeId = workTypeId,
            PlanId = planId,
            CreatorId = creatorId,
            StartDate = startDate,
            EndDate = endDate,
            CreatedDate = DateTime.UtcNow,
            Status = WorkStatus.New
        };

    public void Update(DateTime? startDate, DateTime? endDate)
    {
        StartDate = startDate;
        EndDate = endDate;
    }

    public void SubmitForApproval() => Status = WorkStatus.WaitingForApproval;

    public void Start() => Status = WorkStatus.InProgress;

    public void Complete()
    {
        Status = WorkStatus.Completed;
        RejectionFeedback = null;
    }

    public void Reject(string feedback)
    {
        Status = WorkStatus.InProgress;
        RejectionFeedback = feedback;
    }
}
