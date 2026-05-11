using backend.Application.Common.Interfaces;
using ClosedXML.Excel;

namespace backend.Application.Trees.Queries.ExportTrees;

public record ExportTreesToExcelQuery(List<int>? TreeIds = null, string? Condition = null, string? SearchTerm = null) : IRequest<byte[]>;

public class ExportTreesToExcelQueryHandler : IRequestHandler<ExportTreesToExcelQuery, byte[]>
{
    private readonly IApplicationDbContext _context;

    public ExportTreesToExcelQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<byte[]> Handle(ExportTreesToExcelQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Trees
            .Include(t => t.TreeType)
            .Include(t => t.TreeLocationHistories.OrderByDescending(h => h.FromDate).Take(1))
                .ThenInclude(h => h.Location)
                    .ThenInclude(l => l!.Street)
                        .ThenInclude(s => s!.Ward)
            .AsNoTracking();

        // Nếu có danh sách ID cụ thể, chỉ xuất những cây đó
        if (request.TreeIds != null && request.TreeIds.Any())
        {
            query = query.Where(t => request.TreeIds.Contains(t.Id));
        }
        
        // Lọc theo tình trạng
        if (!string.IsNullOrWhiteSpace(request.Condition))
        {
            query = query.Where(t => t.Condition != null && t.Condition == request.Condition);
        }
        
        // Lọc theo từ khóa tìm kiếm
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t => 
                (t.Name != null && t.Name.ToLower().Contains(searchTerm)) ||
                (t.TreeType != null && t.TreeType.Name != null && t.TreeType.Name.ToLower().Contains(searchTerm)) ||
                t.Id.ToString().Contains(searchTerm));
        }

        var trees = await query.ToListAsync(cancellationToken);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Danh sách cây xanh");

        // Header
        worksheet.Cell(1, 1).Value = "Mã cây";
        worksheet.Cell(1, 2).Value = "Tên cây";
        worksheet.Cell(1, 3).Value = "Loại cây";
        worksheet.Cell(1, 4).Value = "Nhóm";
        worksheet.Cell(1, 5).Value = "Chiều cao (m)";
        worksheet.Cell(1, 6).Value = "Đường kính thân (cm)";
        worksheet.Cell(1, 7).Value = "Tình trạng";
        worksheet.Cell(1, 8).Value = "Vĩ độ";
        worksheet.Cell(1, 9).Value = "Kinh độ";
        worksheet.Cell(1, 10).Value = "Phường/Xã";
        worksheet.Cell(1, 11).Value = "Đường";
        worksheet.Cell(1, 12).Value = "Số nhà";
        worksheet.Cell(1, 13).Value = "Ngày ghi nhận";

        // Style header
        var headerRange = worksheet.Range(1, 1, 1, 13);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4CAF50");
        headerRange.Style.Font.FontColor = XLColor.White;
        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

        // Data
        int row = 2;
        foreach (var tree in trees)
        {
            var location = tree.TreeLocationHistories.FirstOrDefault()?.Location;
            
            worksheet.Cell(row, 1).Value = tree.Id;
            worksheet.Cell(row, 2).Value = tree.Name ?? "";
            worksheet.Cell(row, 3).Value = tree.TreeType?.Name ?? "";
            worksheet.Cell(row, 4).Value = tree.TreeType?.Group ?? "";
            worksheet.Cell(row, 5).Value = tree.Height;
            worksheet.Cell(row, 6).Value = tree.TrunkDiameter;
            worksheet.Cell(row, 7).Value = tree.Condition ?? "";
            worksheet.Cell(row, 8).Value = tree.Latitude;
            worksheet.Cell(row, 9).Value = tree.Longitude;
            worksheet.Cell(row, 10).Value = location?.Street?.Ward?.Name ?? "";
            worksheet.Cell(row, 11).Value = location?.Street?.Name ?? "";
            worksheet.Cell(row, 12).Value = location?.HouseNumber;
            worksheet.Cell(row, 13).Value = tree.RecordedDate?.ToString("dd/MM/yyyy") ?? "";

            row++;
        }

        // Auto-fit columns
        worksheet.Columns().AdjustToContents();

        // Borders
        var dataRange = worksheet.Range(1, 1, row - 1, 13);
        dataRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        dataRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
