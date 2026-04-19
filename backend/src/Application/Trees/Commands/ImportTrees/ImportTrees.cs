using CleanArchitecture.Application.Common.Interfaces;

namespace CleanArchitecture.Application.Trees.Commands.ImportTrees;

public record ImportTreesCommand : IRequest<List<Guid>>
{
}

public class ImportTreesCommandValidator : AbstractValidator<ImportTreesCommand>
{
    public ImportTreesCommandValidator()
    {
    }
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
        throw new NotImplementedException();
    }
}
