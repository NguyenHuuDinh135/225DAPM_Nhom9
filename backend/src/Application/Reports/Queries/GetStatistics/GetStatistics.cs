using backend.Application.Common.Interfaces;

namespace backend.Application.Reports.Queries.GetStatistics;

public record GetStatisticsQuery : IRequest<StatsVm>
{
}

public class GetStatisticsQueryValidator : AbstractValidator<GetStatisticsQuery>
{
    public GetStatisticsQueryValidator()
    {
    }
}

public class GetStatisticsQueryHandler : IRequestHandler<GetStatisticsQuery, StatsVm>
{
    private readonly IApplicationDbContext _context;

    public GetStatisticsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<StatsVm> Handle(GetStatisticsQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
