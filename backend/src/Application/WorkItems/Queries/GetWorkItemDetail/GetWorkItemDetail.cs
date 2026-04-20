using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.WorkItems.Queries.GetWorkItemDetail;

public record GetWorkItemDetailQuery(int Id) : IRequest<WorkItemDetailVm>;

public class WorkItemDetailVm
{
    public int Id { get; init; }
    public string? WorkTypeName { get; init; }
    public string? PlanName { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public WorkStatus Status { get; init; }
    public string? RejectionFeedback { get; init; }
    public IList<WorkProgressDto> Progresses { get; init; } = [];
    public IList<WorkUserDto> Users { get; init; } = [];
    public IList<WorkDetailDto> Details { get; init; } = [];
}

public class WorkProgressDto
{
    public int Id { get; init; }
    public string UpdaterId { get; init; } = string.Empty;
    public int? Percentage { get; init; }
    public string? Note { get; init; }
    public DateTime? UpdatedDate { get; init; }
    public IList<string> Images { get; init; } = [];
}

public class WorkUserDto
{
    public string UserId { get; init; } = string.Empty;
    public string? Role { get; init; }
    public string? Status { get; init; }
}

public class WorkDetailDto
{
    public int Id { get; init; }
    public int TreeId { get; init; }
    public string? Content { get; init; }
    public string? Status { get; init; }
}

public class GetWorkItemDetailQueryHandler : IRequestHandler<GetWorkItemDetailQuery, WorkItemDetailVm>
{
    private readonly IApplicationDbContext _context;

    public GetWorkItemDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorkItemDetailVm> Handle(GetWorkItemDetailQuery request, CancellationToken cancellationToken)
    {
        var vm = await _context.Works
            .AsNoTracking()
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .Include(w => w.WorkProgresses).ThenInclude(p => p.Images)
            .Include(w => w.WorkUsers)
            .Include(w => w.WorkDetails)
            .Where(w => w.Id == request.Id)
            .Select(w => new WorkItemDetailVm
            {
                Id = w.Id,
                WorkTypeName = w.WorkType.Name,
                PlanName = w.Plan.Name,
                CreatorId = w.CreatorId,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                Status = w.Status,
                RejectionFeedback = w.RejectionFeedback,
                Progresses = w.WorkProgresses.Select(p => new WorkProgressDto
                {
                    Id = p.Id,
                    UpdaterId = p.UpdaterId,
                    Percentage = p.Percentage,
                    Note = p.Note,
                    UpdatedDate = p.UpdatedDate,
                    Images = p.Images.Select(i => i.Path).ToList()
                }).ToList(),
                Users = w.WorkUsers.Select(u => new WorkUserDto
                {
                    UserId = u.UserId,
                    Role = u.Role,
                    Status = u.Status
                }).ToList(),
                Details = w.WorkDetails.Select(d => new WorkDetailDto
                {
                    Id = d.Id,
                    TreeId = d.TreeId,
                    Content = d.Content,
                    Status = d.Status
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (vm is null) throw new KeyNotFoundException($"WorkItem {request.Id} not found.");
        return vm;
    }
}
