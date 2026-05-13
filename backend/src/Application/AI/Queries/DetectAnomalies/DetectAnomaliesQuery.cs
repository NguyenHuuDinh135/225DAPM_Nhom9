using backend.Application.Common.Interfaces;

namespace backend.Application.AI.Queries.DetectAnomalies;

public record DetectAnomaliesQuery : IRequest<List<int>>;

public class DetectAnomaliesQueryHandler : IRequestHandler<DetectAnomaliesQuery, List<int>>
{
    private const string CacheKey = "ai:anomalies";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(5);

    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;
    private readonly ICacheService _cacheService;

    public DetectAnomaliesQueryHandler(
        IApplicationDbContext context,
        IAIService aiService,
        ICacheService cacheService)
    {
        _context = context;
        _aiService = aiService;
        _cacheService = cacheService;
    }

    public async Task<List<int>> Handle(DetectAnomaliesQuery request, CancellationToken cancellationToken)
    {
        var cached = await _cacheService.GetAsync<List<int>>(CacheKey);
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

        var anomalies = await _aiService.DetectAnomaliesAsync(trees);

        await _cacheService.SetAsync(CacheKey, anomalies, CacheTtl);

        return anomalies;
    }
}
