using backend.Application.Common.Interfaces;
using backend.Application.Reports.Queries.GetReports;

namespace backend.Application.Reports.Queries.GetReports;

public record GetReportsQuery : IRequest<ReportsVm>
{
}

public class GetReportsQueryValidator : AbstractValidator<GetReportsQuery>
{
    public GetReportsQueryValidator()
    {
    }
}

public class GetReportsQueryHandler : IRequestHandler<GetReportsQuery, ReportsVm>
{
    private readonly IApplicationDbContext _context;

    public GetReportsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReportsVm> Handle(GetReportsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
