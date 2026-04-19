using backend.Application.Common.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Trees.Commands.ImportTrees;

public record ImportTreesCommand : IRequest<List<int>>
{
    public int TreeTypeId { get; init; }
    public int Quantity { get; init; }
    public string BatchNumber { get; init; } = string.Empty;
}

public class ImportTreesCommandHandler : IRequestHandler<ImportTreesCommand, List<int>>
{
    private readonly IApplicationDbContext _context;

    public ImportTreesCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<int>> Handle(ImportTreesCommand request, CancellationToken cancellationToken)
    {
        var importedTreeIds = new List<int>();

        for (int i = 0; i < request.Quantity; i++)
        {
            var tree = new Tree { TreeTypeId = request.TreeTypeId };
            _context.Trees.Add(tree);
            await _context.SaveChangesAsync(cancellationToken);
            importedTreeIds.Add(tree.Id);
        }

        return importedTreeIds;
    }
}
