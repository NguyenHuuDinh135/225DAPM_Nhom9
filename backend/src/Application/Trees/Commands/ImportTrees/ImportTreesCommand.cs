using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Trees.Commands.ImportTrees;

public record ImportTreesCommand : IRequest<List<Guid>>
{
    public Guid TreeTypeId { get; init; }
    public int Quantity { get; init; }
    public string BatchNumber { get; init; } = string.Empty;
}

public class ImportTreesCommandHandler : IRequestHandler<ImportTreesCommand, List<Guid>>
{
    private readonly IApplicationDbContext _context;

    public ImportTreesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Guid>> Handle(ImportTreesCommand request, CancellationToken cancellationToken)
    {
        var importedTreeIds = new List<Guid>();

        for (int i = 0; i < request.Quantity; i++)
        {
            var tree = new Tree
            {
                // Tùy thuộc vào cấu trúc Entity Tree của bạn mà map cho chuẩn nhé. 
                // Ở đây mình giả định một số trường cơ bản khi cây đang ở vườn ươm:
                // TreeTypeId = request.TreeTypeId,
                // Status = "InNursery", 
                // Latitude = null, // Chưa mang ra trồng nên chưa có tọa độ
                // Longitude = null
            };

            _context.Trees.Add(tree);
            importedTreeIds.Add(tree.Id);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return importedTreeIds;
    }
}
