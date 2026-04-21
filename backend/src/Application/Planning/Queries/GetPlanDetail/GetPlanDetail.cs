using backend.Application.Common.Interfaces;

namespace backend.Application.Planning.Queries.GetPlanDetail;

public record GetPlanDetailQuery(int Id) : IRequest<PlanDetailVm>;

public class PlanDetailVm
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Status { get; init; }
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
}

public class GetPlanDetailQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetPlanDetailQuery, PlanDetailVm>
{
    public async Task<PlanDetailVm> Handle(GetPlanDetailQuery request, CancellationToken cancellationToken)
    {
        var plan = await context.Plans
            .AsNoTracking()
            .Include(p => p.Works).ThenInclude(w => w.WorkType)
            .Where(p => p.Id == request.Id)
            .Select(p => new PlanDetailVm
            {
                Id = p.Id,
                Name = p.Name,
                Status = p.Status,
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
                    Status = w.Status.ToString()
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (plan is null) throw new KeyNotFoundException($"Plan {request.Id} not found.");
        return plan;
    }
}
