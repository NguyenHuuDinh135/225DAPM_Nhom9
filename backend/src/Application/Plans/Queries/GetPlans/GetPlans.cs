using backend.Application.Common.Interfaces;

namespace backend.Application.Plans.Queries.GetPlans;

public record GetPlansQuery : IRequest<PlansVm>;

public class GetPlansQueryHandler : IRequestHandler<GetPlansQuery, PlansVm>
{
    private readonly IApplicationDbContext _context;

    public GetPlansQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PlansVm> Handle(GetPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await _context.Plans
            .AsNoTracking()
            .OrderByDescending(p => p.Created)
            .Select(p => new PlanDto
            {
                Id = p.Id,
                Name = p.Name,
                CreatorId = p.CreatorId,
                ApproverId = p.ApproverId,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Status = p.Status,
                WorkCount = p.Works.Count,
            })
            .ToListAsync(cancellationToken);

        return new PlansVm { Plans = plans };
    }
}
