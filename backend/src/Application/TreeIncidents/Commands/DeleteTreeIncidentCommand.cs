using backend.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.TreeIncidents.Commands;

public record DeleteTreeIncidentCommand(int Id) : IRequest<bool>;

public class DeleteTreeIncidentCommandHandler : IRequestHandler<DeleteTreeIncidentCommand, bool>
{
    private readonly IApplicationDbContext _context;
    public DeleteTreeIncidentCommandHandler(IApplicationDbContext context) => _context = context;
    public async Task<bool> Handle(DeleteTreeIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await _context.TreeIncidents.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (incident == null) return false;
        _context.TreeIncidents.Remove(incident);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
