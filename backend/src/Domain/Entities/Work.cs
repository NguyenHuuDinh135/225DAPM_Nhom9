using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

/// <summary>
/// Đại diện cho một công việc cụ thể trong kế hoạch chăm sóc cây xanh.
/// Công việc được giao cho nhân viên thực hiện và theo dõi tiến độ.
/// </summary>
public class Work : BaseAuditableEntity
{
    private Work() { } // EF Core

    public Work(int workTypeId, int planId, string creatorId, DateTime? startDate, DateTime? endDate)
    {
        WorkTypeId = workTypeId;
        PlanId = planId;
        CreatorId = creatorId;
        StartDate = startDate;
        EndDate = endDate;
        Status = WorkStatus.New;
        CreatedDate = DateTime.UtcNow;
    }

    public int WorkTypeId { get; private set; }
    public string CreatorId { get; private set; } = null!;
    public int PlanId { get; private set; }

    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }

    public WorkStatus Status { get; private set; }

    public WorkType WorkType { get; private set; } = null!;
    public Plan Plan { get; private set; } = null!;

    public ICollection<WorkDetail> WorkDetails { get; private set; } = new List<WorkDetail>();
    public ICollection<WorkUser> WorkUsers { get; private set; } = new List<WorkUser>();
    public ICollection<WorkProgress> WorkProgresses { get; private set; } = new List<WorkProgress>();

    public void Update(int workTypeId, DateTime? startDate, DateTime? endDate, WorkStatus status)
    {
        WorkTypeId = workTypeId;
        StartDate = startDate;
        EndDate = endDate;
        Status = status;
    }
}
