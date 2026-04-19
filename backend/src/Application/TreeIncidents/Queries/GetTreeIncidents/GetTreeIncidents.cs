using backend.Application.Common.Interfaces;

namespace backend.Application.TreeIncidents.Queries.GetTreeIncidents;

public record GetTreeIncidentsQuery : IRequest<TreeIncidentsVm>
{
}

public class GetTreeIncidentsQueryValidator : AbstractValidator<GetTreeIncidentsQuery>
{
    public GetTreeIncidentsQueryValidator()
    {
    }
}

public class GetTreeIncidentsQueryHandler : IRequestHandler<GetTreeIncidentsQuery, TreeIncidentsVm>
{
    private readonly IApplicationDbContext _context;

    public GetTreeIncidentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeIncidentsVm> Handle(GetTreeIncidentsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
