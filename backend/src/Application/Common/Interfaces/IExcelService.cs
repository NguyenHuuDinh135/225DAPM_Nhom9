using backend.Application.Reports.Queries.GetDashboardStatistics;

namespace backend.Application.Common.Interfaces;

public record TreeImportRow(int TreeTypeId, string? Name, string? Condition, decimal? Height, decimal? TrunkDiameter);

public interface IExcelService
{
    Task<byte[]> ExportDashboardStatsAsync(DashboardStatsVm stats);
    List<TreeImportRow> ParseTreeImport(Stream stream);
}
