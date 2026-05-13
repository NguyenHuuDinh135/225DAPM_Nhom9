using backend.Application.Common.Interfaces;

namespace backend.Application.AI.Queries.PredictMaintenance;

public record PredictMaintenanceQuery : IRequest<List<MaintenancePrediction>>;

public class PredictMaintenanceQueryHandler : IRequestHandler<PredictMaintenanceQuery, List<MaintenancePrediction>>
{
    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;

    public PredictMaintenanceQueryHandler(IApplicationDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task<List<MaintenancePrediction>> Handle(PredictMaintenanceQuery request, CancellationToken cancellationToken)
    {
        var trees = await _context.Trees
            .AsNoTracking()
            .Include(t => t.TreeType)
            .Select(t => new TreeHealthData(
                t.Id,
                t.Name,
                t.Condition,
                t.TreeType != null ? t.TreeType.Name : null,
                t.RecordedDate,
                t.TreeType != null ? t.TreeType.MaintenanceIntervalDays : null))
            .ToListAsync(cancellationToken);

        return await _aiService.PredictMaintenanceAsync(trees);
    }
}
