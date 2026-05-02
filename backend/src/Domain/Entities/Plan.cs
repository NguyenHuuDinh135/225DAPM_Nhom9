using backend.Domain.Common;
using backend.Domain.Enums;

namespace backend.Domain.Entities;

public class Plan : BaseAuditableEntity
{
    public string? Name { get; private set; }
    public string CreatorId { get; private set; } = null!;
    public string? ApproverId { get; private set; }
    public DateTime? CreatedDate { get; private set; }
    public DateTime? StartDate { get; private set; }
    public DateTime? EndDate { get; private set; }
    public PlanStatus Status { get; private set; }
    public string? RejectionReason { get; private set; }
    public DateTime? SubmittedDate { get; private set; }
    public DateTime? ApprovedDate { get; private set; }

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
            Status = PlanStatus.Draft
        };

    public void Update(string? name, DateTime? startDate, DateTime? endDate)
    {
        if (Status != PlanStatus.Draft && Status != PlanStatus.NeedsRevision)
            throw new InvalidOperationException("Chỉ có thể sửa kế hoạch ở trạng thái Nháp hoặc Cần chỉnh sửa.");

        Name = name;
        StartDate = startDate;
        EndDate = endDate;
    }

    public void SubmitForApproval()
    {
        if (Status != PlanStatus.Draft && Status != PlanStatus.NeedsRevision)
            throw new InvalidOperationException("Kế hoạch không ở trạng thái hợp lệ để gửi duyệt.");
        
        Status = PlanStatus.PendingApproval;
        SubmittedDate = DateTime.UtcNow;
    }

    public void RequestRevision(string reason)
    {
        if (Status != PlanStatus.PendingApproval)
            throw new InvalidOperationException("Chỉ có thể yêu cầu sửa đổi khi kế hoạch đang chờ duyệt.");

        Status = PlanStatus.NeedsRevision;
        RejectionReason = reason;
    }

    public void Approve(string approverId)
    {
        if (Status != PlanStatus.PendingApproval)
            throw new InvalidOperationException("Chỉ có thể duyệt khi kế hoạch đang chờ duyệt.");

        ApproverId = approverId;
        Status = PlanStatus.Approved;
        ApprovedDate = DateTime.UtcNow;
        RejectionReason = null;
    }

    public void Reject(string reason)
    {
        if (Status != PlanStatus.PendingApproval)
            throw new InvalidOperationException("Chỉ có thể từ chối khi kế hoạch đang chờ duyệt.");

        Status = PlanStatus.Rejected;
        RejectionReason = reason;
    }

    public void Complete()
    {
        if (Status != PlanStatus.Approved)
            throw new InvalidOperationException("Chỉ có thể hoàn thành khi kế hoạch đã được duyệt.");

        Status = PlanStatus.Completed;
    }

    public void Cancel()
    {
        Status = PlanStatus.Cancelled;
    }
}
