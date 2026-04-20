using backend.Application.Common.Interfaces;
using backend.Application.Reports.Queries.GetDashboardStatistics;
using ClosedXML.Excel;

namespace backend.Infrastructure.Files;

public class ExcelService : IExcelService
{
    public Task<byte[]> ExportDashboardStatsAsync(DashboardStatsVm stats)
    {
        using var wb = new XLWorkbook();

        // Sheet 1: Tổng quan
        var ws1 = wb.AddWorksheet("Tổng quan");
        ws1.Cell(1, 1).Value = "Chỉ số";
        ws1.Cell(1, 2).Value = "Giá trị";
        ws1.Cell(2, 1).Value = "Tổng cây";
        ws1.Cell(2, 2).Value = stats.TotalTrees;
        ws1.Cell(3, 1).Value = "Sự cố chờ xử lý";
        ws1.Cell(3, 2).Value = stats.PendingIncidents;
        ws1.Cell(4, 1).Value = "Công việc hoàn thành trong tháng";
        ws1.Cell(4, 2).Value = stats.CompletedWorksThisMonth;
        ws1.Cell(5, 1).Value = "Công việc đang chờ trong tháng";
        ws1.Cell(5, 2).Value = stats.PendingWorksThisMonth;

        // Sheet 2: Công việc quá hạn
        var ws2 = wb.AddWorksheet("Công việc quá hạn");
        ws2.Cell(1, 1).Value = "ID";
        ws2.Cell(1, 2).Value = "Loại công việc";
        ws2.Cell(1, 3).Value = "Ngày kết thúc";
        ws2.Cell(1, 4).Value = "Trạng thái";
        for (int i = 0; i < stats.OverdueWorks.Count; i++)
        {
            var w = stats.OverdueWorks[i];
            ws2.Cell(i + 2, 1).Value = w.Id;
            ws2.Cell(i + 2, 2).Value = w.WorkTypeName;
            ws2.Cell(i + 2, 3).Value = w.EndDate?.ToString("dd/MM/yyyy");
            ws2.Cell(i + 2, 4).Value = w.Status;
        }

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        return Task.FromResult(ms.ToArray());
    }
}
