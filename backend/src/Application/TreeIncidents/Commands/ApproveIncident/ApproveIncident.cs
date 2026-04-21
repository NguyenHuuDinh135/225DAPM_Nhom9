using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.TreeIncidents.Commands.ApproveIncident;

public record ApproveIncidentCommand(int Id, string ApproverId) : IRequest<IStatusResult>;

public class ApproveIncidentCommandHandler(IApplicationDbContext context)
    : IRequestHandler<ApproveIncidentCommand, IStatusResult>
{
    public async Task<IStatusResult> Handle(ApproveIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await context.TreeIncidents.FindAsync([request.Id], cancellationToken);
        if (incident is null) return StatusResult.Failure("Incident not found.");
        incident.Approve(request.ApproverId);
        await context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
