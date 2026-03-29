using backend.Application.Common.Interfaces;

namespace backend.Application.Works.Queries.GetWorks;

public record GetWorksQuery : IRequest<WorksVm>;

public class GetWorksQueryHandler : IRequestHandler<GetWorksQuery, WorksVm>
{
    private readonly IApplicationDbContext _context;

    public GetWorksQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorksVm> Handle(GetWorksQuery request, CancellationToken cancellationToken)
    {
        var works = await _context.Works
            .AsNoTracking()
            .Include(w => w.WorkType)
            .OrderByDescending(w => w.Created)
            .Select(w => new WorkDto
            {
                Id = w.Id,
                WorkTypeId = w.WorkTypeId,
                WorkTypeName = w.WorkType.Name,
                PlanId = w.PlanId,
                CreatorId = w.CreatorId,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                Status = w.Status.ToString(),
            })
            .ToListAsync(cancellationToken);

        return new WorksVm { Works = works };
    }
}
