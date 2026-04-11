using backend.Application.Common.Interfaces;

namespace backend.Application.Progress.Queries.TrackProgress;

public record TrackProgressQuery : IRequest<ProgressVm>
{
}

public class TrackProgressQueryValidator : AbstractValidator<TrackProgressQuery>
{
    public TrackProgressQueryValidator()
    {
    }
}

public class TrackProgressQueryHandler : IRequestHandler<TrackProgressQuery, ProgressVm>
{
    private readonly IApplicationDbContext _context;

    public TrackProgressQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProgressVm> Handle(TrackProgressQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
