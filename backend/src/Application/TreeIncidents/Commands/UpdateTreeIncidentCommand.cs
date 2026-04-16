using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.TreeIncidents.Commands;

public record UpdateTreeIncidentCommand(int Id, int TreeId, string? Content, DateTime? ReportedDate) : IRequest<bool>;

public class UpdateTreeIncidentCommandHandler : IRequestHandler<UpdateTreeIncidentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public UpdateTreeIncidentCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task<bool> Handle(UpdateTreeIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _context.TreeIncidents.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (incident == null) return false;
        incident.TreeId = request.TreeId;
        incident.Content = request.Content ?? incident.Content;
        incident.ReportedDate = request.ReportedDate ?? incident.ReportedDate;
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
