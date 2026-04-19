using backend.Application.Common.Interfaces;
using backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;

namespace backend.Application.TreeIncidents.Queries.GetTreeIncidentDetail;

public record GetTreeIncidentDetailQuery : IRequest<TreeIncidentDetailDto>
{
}

public class GetTreeIncidentDetailQueryValidator : AbstractValidator<GetTreeIncidentDetailQuery>
{
    public GetTreeIncidentDetailQueryValidator()
    {
    }
}

public class GetTreeIncidentDetailQueryHandler : IRequestHandler<GetTreeIncidentDetailQuery, TreeIncidentDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetTreeIncidentDetailQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TreeIncidentDetailDto> Handle(GetTreeIncidentDetailQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
