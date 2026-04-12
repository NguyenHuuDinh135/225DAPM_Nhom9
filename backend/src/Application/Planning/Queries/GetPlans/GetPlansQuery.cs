using backend.Application.Common.Interfaces;

namespace backend.Application.Planning.Queries.GetPlans;

public record GetPlansQuery : IRequest<List<PlanDto>>;

public class PlanDto
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public string? ApproverId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? Status { get; init; }
    public int WorkCount { get; init; }
}

public class GetPlansQueryHandler : IRequestHandler<GetPlansQuery, List<PlanDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPlansQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PlanDto>> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        return await _context.Plans
            .Select(p => new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                CreatorId = p.CreatorId,
                ApproverId = p.ApproverId,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status,
                WorkCount = p.Works.Count
            })
            .ToListAsync(cancellationToken);
    }
}
