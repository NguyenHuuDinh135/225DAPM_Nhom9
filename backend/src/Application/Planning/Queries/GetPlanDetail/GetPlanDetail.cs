using backend.Application.Common.Interfaces;

namespace backend.Application.Planning.Queries.GetPlanDetail;

public record GetPlanDetailQuery(int Id) : IRequest<PlanDetailVm>;

public class PlanDetailVm
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Status { get; init; }
    public string? StatusName { get; init; }
    public string? RejectionReason { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public string? ApproverId { get; init; }
    public List<PlanWorkItemDto> Works { get; init; } = [];
}

public class PlanWorkItemDto
{
    public int Id { get; init; }
    public string? WorkTypeName { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string Status { get; init; } = string.Empty;
    public List<string> TreeNames { get; init; } = [];
    public List<string> AssignedUserNames { get; set; } = [];
}

public class GetPlanDetailQueryHandler(IApplicationDbContext context, IIdentityService identityService)
    : IRequestHandler<GetPlanDetailQuery, PlanDetailVm>
{
    public async Task<PlanDetailVm> Handle(GetPlanDetailQuery request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans
            .AsNoTracking()
            .Include(p => p.Works).ThenInclude(w => w.WorkType)
            .Include(p => p.Works).ThenInclude(w => w.WorkDetails).ThenInclude(wd => wd.Tree)
            .Include(p => p.Works).ThenInclude(w => w.WorkUsers)
            .Where(p => p.Id == request.Id)
            .Select(p => new PlanDetailVm
            {
                Id = p.Id,
                Name = p.Name,
                Status = p.Status.ToString(),
                StatusName = p.Status == Domain.Enums.PlanStatus.Draft ? "Mới tạo" :
                             p.Status == Domain.Enums.PlanStatus.PendingApproval ? "Đang chờ duyệt" :
                             p.Status == Domain.Enums.PlanStatus.NeedsRevision ? "Yêu cầu chỉnh sửa" :
                             p.Status == Domain.Enums.PlanStatus.Approved ? "Đã duyệt" :
                             p.Status == Domain.Enums.PlanStatus.Rejected ? "Bị từ chối" :
                             p.Status == Domain.Enums.PlanStatus.Completed ? "Hoàn thành" : "Đã hủy",
                RejectionReason = p.RejectionReason,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                CreatorId = p.CreatorId,
                ApproverId = p.ApproverId,
                Works = p.Works.Select(w => new PlanWorkItemDto
                {
                    Id = w.Id,
                    WorkTypeName = w.WorkType.Name,
                    StartDate = w.StartDate,
                    EndDate = w.EndDate,
                    Status = w.Status.ToString(),
                    TreeNames = w.WorkDetails.Select(wd => wd.Tree.Name ?? "Cây chưa đặt tên").ToList(),
                    AssignedUserNames = w.WorkUsers.Select(wu => wu.UserId).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (plan is null) throw new KeyNotFoundException($"Plan {request.Id} not found.");

        // Map User IDs to FullNames
        var allUsers = await identityService.GetUsersAsync();
        foreach (var work in plan.Works)
        {
            var userIds = work.AssignedUserNames; // currently contains IDs
            work.AssignedUserNames = userIds
                .Select(id => allUsers.FirstOrDefault(u => u.Id == id)?.FullName ?? 
                              allUsers.FirstOrDefault(u => u.Id == id)?.UserName ?? id)
                .ToList();
        }

        return plan;
    }
}
