using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

namespace backend.Application.AI.Queries.GenerateReport;

public record GenerateReportQuery(string ReportType) : IRequest<string>;

public class GenerateReportQueryValidator : AbstractValidator<GenerateReportQuery>
{
    private static readonly string[] ValidTypes = ["daily", "weekly", "monthly"];

    public GenerateReportQueryValidator()
    {
        RuleFor(x => x.ReportType)
            .NotEmpty()
            .Must(t => ValidTypes.Contains(t.ToLowerInvariant()))
            .WithMessage("ReportType must be 'daily', 'weekly', or 'monthly'.");
    }
}

public class GenerateReportQueryHandler : IRequestHandler<GenerateReportQuery, string>
{
    private readonly IApplicationDbContext _context;
    private readonly IAIService _aiService;

    public GenerateReportQueryHandler(IApplicationDbContext context, IAIService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    public async Task<string> Handle(GenerateReportQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var since = request.ReportType.ToLowerInvariant() switch
        {
            "daily" => now.AddDays(-1),
            "weekly" => now.AddDays(-7),
            "monthly" => now.AddMonths(-1),
            _ => now.AddDays(-1)
        };

        var totalTrees = await _context.Trees.CountAsync(cancellationToken);
        var newIncidents = await _context.TreeIncidents
            .Where(i => i.Created >= since)
            .CountAsync(cancellationToken);
        var completedWorks = await _context.Works
            .Where(w => w.Status == WorkStatus.Completed && w.LastModified >= since)
            .CountAsync(cancellationToken);
        var inProgressWorks = await _context.Works
            .Where(w => w.Status == WorkStatus.InProgress)
            .CountAsync(cancellationToken);

        var reportData = new
        {
            ReportType = request.ReportType,
            Period = new { From = since, To = now },
            TotalTrees = totalTrees,
            NewIncidents = newIncidents,
            CompletedWorks = completedWorks,
            InProgressWorks = inProgressWorks
        };

        return await _aiService.GenerateReportAsync(request.ReportType, reportData);
    }
}
