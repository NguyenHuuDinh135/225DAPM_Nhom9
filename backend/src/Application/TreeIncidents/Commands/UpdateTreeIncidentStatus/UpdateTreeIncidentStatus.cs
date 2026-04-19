namespace backend.Application.TreeIncidents.Commands.UpdateTreeIncidentStatus;

public record UpdateTreeIncidentStatusCommand : IRequest
{
    public Guid Id { get; init; }
    public IncidentStatus Status { get; init; }
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
            .FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null)
        {
            throw new NotFoundException(nameof(TreeIncident), request.Id);
        }

        // Cập nhật trạng thái
        entity.Status = request.Status;

        // Nếu trạng thái là Hoàn thành, ghi nhận thời gian
        if (request.Status == IncidentStatus.Resolved)
        {
            entity.ResolvedDate = DateTime.Now;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
