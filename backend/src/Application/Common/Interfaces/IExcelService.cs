using backend.Application.Reports.Queries.GetDashboardStatistics;

namespace backend.Application.Common.Interfaces;

public interface IExcelService
{
    Task<byte[]> ExportDashboardStatsAsync(DashboardStatsVm stats);
}
