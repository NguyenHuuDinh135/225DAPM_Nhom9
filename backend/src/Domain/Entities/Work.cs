using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một công việc cụ thể trong kế hoạch chăm sóc cây xanh.
/// Công việc được giao cho nhân viên thực hiện và theo dõi tiến độ.
/// </summary>
public class Work : BaseAuditableEntity
{
    public int WorkTypeId { get;  set; }
    public string CreatorId { get;  set; } = null!;
    public int PlanId { get;  set; }

    public DateTime? CreatedDate { get;  set; }
    public DateTime? StartDate { get;  set; }
    public DateTime? EndDate { get;  set; }

    public WorkStatus Status { get;  set; }

    public WorkType WorkType { get;  set; } = null!;
    public Plan Plan { get;  set; } = null!;

    public string? RejectionFeedback { get; private set; }

    public ICollection<WorkDetail> WorkDetails { get;  set; } = new List<WorkDetail>();
    public ICollection<WorkUser> WorkUsers { get;  set; } = new List<WorkUser>();
    public ICollection<WorkProgress> WorkProgresses { get;  set; } = new List<WorkProgress>();

    public void SubmitForApproval() => Status = WorkStatus.WaitingForApproval;

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
