using backend.Application.Reports.Queries.GetDashboardStatistics;
using backend.Infrastructure.Files;
using ClosedXML.Excel;
using NUnit.Framework;
using Shouldly;

namespace backend.Infrastructure.IntegrationTests;

public class ExcelServiceTests
{
    private ExcelService _sut = null!;

    [SetUp]
    public void SetUp()
    {
        _sut = new ExcelService();
    }

    [Test]
    public async Task ExportDashboardStatsAsync_ShouldReturnNonEmptyByteArray()
    {
        var stats = new DashboardStatsVm
        {
            TotalTrees = 100,
            PendingIncidents = 5,
            CompletedWorksThisMonth = 20,
            PendingWorksThisMonth = 10,
            TotalStreets = 50,
            TotalWards = 8,
            OverdueWorks =
            [
                new WorkItemBriefDto
                {
                    Id = 1,
                    WorkTypeName = "Cắt tỉa",
                    EndDate = new DateTime(2026, 4, 1),
                    Status = "InProgress"
                }
            ]
        };

        var result = await _sut.ExportDashboardStatsAsync(stats);

        result.ShouldNotBeNull();
        result.Length.ShouldBeGreaterThan(0);

        // Verify the byte array is a valid Excel file
        using var ms = new MemoryStream(result);
        using var wb = new XLWorkbook(ms);
        wb.Worksheets.Count.ShouldBe(2);
        wb.Worksheet("Tổng quan").Cell(2, 2).GetValue<int>().ShouldBe(100);
        wb.Worksheet("Công việc quá hạn").Cell(2, 2).GetString().ShouldBe("Cắt tỉa");
    }

    [Test]
    public void ParseTreeImport_ShouldCorrectlyParseValidExcelFile()
    {
        // Arrange: create an in-memory Excel file with the expected columns
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Trees");
        // Header row
        ws.Cell(1, 1).Value = "TreeTypeId";
        ws.Cell(1, 2).Value = "Name";
        ws.Cell(1, 3).Value = "Condition";
        ws.Cell(1, 4).Value = "Height";
        ws.Cell(1, 5).Value = "TrunkDiameter";
        // Data rows
        ws.Cell(2, 1).Value = 1;
        ws.Cell(2, 2).Value = "Cây Bàng";
        ws.Cell(2, 3).Value = "Tốt";
        ws.Cell(2, 4).Value = 5.5;
        ws.Cell(2, 5).Value = 0.3;

        ws.Cell(3, 1).Value = 2;
        ws.Cell(3, 2).Value = "Cây Phượng";
        ws.Cell(3, 3).Value = "";
        ws.Cell(3, 4).Value = 8.0;
        ws.Cell(3, 5).Value = 0.5;

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        // Act
        var rows = _sut.ParseTreeImport(ms);

        // Assert
        rows.Count.ShouldBe(2);

        rows[0].TreeTypeId.ShouldBe(1);
        rows[0].Name.ShouldBe("Cây Bàng");
        rows[0].Condition.ShouldBe("Tốt");
        rows[0].Height.ShouldBe(5.5m);
        rows[0].TrunkDiameter.ShouldBe(0.3m);

        rows[1].TreeTypeId.ShouldBe(2);
        rows[1].Name.ShouldBe("Cây Phượng");
        rows[1].Condition.ShouldBeNull(); // empty string becomes null
        rows[1].Height.ShouldBe(8.0m);
        rows[1].TrunkDiameter.ShouldBe(0.5m);
    }

    [Test]
    public void ParseTreeImport_ShouldSkipRowsWithZeroTreeTypeId()
    {
        using var wb = new XLWorkbook();
        var ws = wb.AddWorksheet("Trees");
        ws.Cell(1, 1).Value = "TreeTypeId";
        ws.Cell(1, 2).Value = "Name";
        ws.Cell(1, 3).Value = "Condition";
        ws.Cell(1, 4).Value = "Height";
        ws.Cell(1, 5).Value = "TrunkDiameter";

        // Valid row
        ws.Cell(2, 1).Value = 1;
        ws.Cell(2, 2).Value = "Cây Bàng";
        ws.Cell(2, 3).Value = "Tốt";
        ws.Cell(2, 4).Value = 5.5;
        ws.Cell(2, 5).Value = 0.3;

        // Invalid row (TreeTypeId = 0)
        ws.Cell(3, 1).Value = 0;
        ws.Cell(3, 2).Value = "Invalid";
        ws.Cell(3, 3).Value = "";
        ws.Cell(3, 4).Value = 0;
        ws.Cell(3, 5).Value = 0;

        using var ms = new MemoryStream();
        wb.SaveAs(ms);
        ms.Position = 0;

        var rows = _sut.ParseTreeImport(ms);

        rows.Count.ShouldBe(1);
        rows[0].Name.ShouldBe("Cây Bàng");
    }
}
