using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;

namespace backend.Application.Trees.Commands.ImportTrees;

public record ImportTreesFromExcelCommand(Stream FileStream) : IRequest<IStatusResult>;

public class ImportTreesFromExcelCommandHandler : IRequestHandler<ImportTreesFromExcelCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IExcelService _excel;

    public ImportTreesFromExcelCommandHandler(IApplicationDbContext context, IExcelService excel)
    {
        _context = context;
        _excel = excel;
    }

    public async Task<IStatusResult> Handle(ImportTreesFromExcelCommand request, CancellationToken cancellationToken)
    {
        var rows = _excel.ParseTreeImport(request.FileStream);
        if (rows.Count == 0)
            return StatusResult.Failure("File không có dữ liệu hợp lệ.");

        var trees = rows.Select(r => new Tree
        {
            TreeTypeId = r.TreeTypeId,
            Name = r.Name,
            Condition = r.Condition,
            Height = r.Height,
            TrunkDiameter = r.TrunkDiameter,
            RecordedDate = DateTime.UtcNow
        }).ToList();

        _context.Trees.AddRange(trees);
        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
