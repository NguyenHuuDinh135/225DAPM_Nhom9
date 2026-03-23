using backend.Application.Common.Interfaces;

namespace backend.Application.Incidents.Queries.GetIncidents;

public record GetIncidentsQuery : IRequest<IncidentsVm>
{
}

public class GetIncidentsQueryValidator : AbstractValidator<GetIncidentsQuery>
{
    public GetIncidentsQueryValidator()
    {
    }
}

public class GetIncidentsQueryHandler : IRequestHandler<GetIncidentsQuery, IncidentsVm>
{
    private readonly IApplicationDbContext _context;

    public GetIncidentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IncidentsVm> Handle(GetIncidentsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
