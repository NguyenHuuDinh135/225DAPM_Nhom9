using backend.Application.Common.Interfaces;
using backend.Application.Reports.Queries.GetDashboardStatistics;

namespace backend.Application.Reports.Queries.ExportDashboardStats;

public record ExportDashboardStatsQuery : IRequest<ExportDashboardStatsResult>;

public class ExportDashboardStatsResult
{
    public byte[] Content { get; init; } = [];
    public string ContentType { get; init; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    public string FileName { get; init; } = null!;
}

public class ExportDashboardStatsQueryHandler : IRequestHandler<ExportDashboardStatsQuery, ExportDashboardStatsResult>
{
    private readonly ISender _sender;
    private readonly IExcelService _excel;

    public ExportDashboardStatsQueryHandler(ISender sender, IExcelService excel)
    {
        _sender = sender;
        _excel = excel;
    }

    public async Task<ExportDashboardStatsResult> Handle(ExportDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var stats = await _sender.Send(new GetDashboardStatisticsQuery(), cancellationToken);
        var bytes = await _excel.ExportDashboardStatsAsync(stats);
        var now = DateTime.UtcNow;

        return new ExportDashboardStatsResult
        {
            Content = bytes,
            FileName = $"BaoCaoCayXanh_Thang{now.Month}_{now.Year}.xlsx"
        };
    }
}
