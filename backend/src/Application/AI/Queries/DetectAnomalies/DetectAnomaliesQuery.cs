using backend.Application.Common.Interfaces;

namespace backend.Application.AI.Queries.DetectAnomalies;

public record DetectAnomaliesQuery : IRequest<List<int>>;

public class DetectAnomaliesQueryHandler : IRequestHandler<DetectAnomaliesQuery, List<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;

    public DetectAnomaliesQueryHandler(IApplicationDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task<List<int>> Handle(DetectAnomaliesQuery request, CancellationToken cancellationToken)
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

        return await _aiService.DetectAnomaliesAsync(trees);
    }
}
