using backend.Application.Common.Interfaces;

namespace backend.Application.AI.Queries.PredictMaintenance;

public record PredictMaintenanceQuery : IRequest<List<MaintenancePrediction>>;

public class PredictMaintenanceQueryHandler : IRequestHandler<PredictMaintenanceQuery, List<MaintenancePrediction>>
{
    private const string CacheKey = "ai:predictions";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(30);

    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;
    private readonly ICacheService _cacheService;

    public PredictMaintenanceQueryHandler(
        IApplicationDbContext context,
        IAIService aiService,
        ICacheService cacheService)
    {
        _context = context;
        _aiService = aiService;
        _cacheService = cacheService;
    }

    public async Task<List<MaintenancePrediction>> Handle(PredictMaintenanceQuery request, CancellationToken cancellationToken)
    {
        var cached = await _cacheService.GetAsync<List<MaintenancePrediction>>(CacheKey);
        if (cached is not null)
        {
            return cached;
        }

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

        var predictions = await _aiService.PredictMaintenanceAsync(trees);

        await _cacheService.SetAsync(CacheKey, predictions, CacheTtl);

        return predictions;
    }
}
