using backend.Application.Common.Interfaces;

namespace backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;

public record UpdateTreeIncidentStatusCommand : IRequest
{
    public int Id { get; init; }
    public string Status { get; init; } = null!;
}

public class UpdateTreeIncidentStatusCommandHandler : IRequestHandler<UpdateTreeIncidentStatusCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateTreeIncidentStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateTreeIncidentStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TreeIncidents
            .FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new KeyNotFoundException($"TreeIncident {request.Id} not found.");

        entity.UpdateStatus(request.Status);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
