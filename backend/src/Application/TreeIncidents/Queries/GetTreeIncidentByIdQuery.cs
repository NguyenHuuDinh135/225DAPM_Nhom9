using backend.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.TreeIncidents.Queries;

public record GetTreeIncidentByIdQuery(int Id) : IRequest<TreeIncidentDto?>;

public class GetTreeIncidentByIdQueryHandler : IRequestHandler<GetTreeIncidentByIdQuery, TreeIncidentDto?>
{
    private readonly IApplicationDbContext _context;
    public GetTreeIncidentByIdQueryHandler(IApplicationDbContext context) => _context = context;
    public async Task<TreeIncidentDto?> Handle(GetTreeIncidentByIdQuery request, CancellationToken cancellationToken)
    {
        var t = await _context.TreeIncidents.FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (t == null) return null;
        return new TreeIncidentDto
        {
            Id = t.Id,
            TreeId = t.TreeId,
            Content = t.Content,
            Status = t.Status,
            ReportedDate = t.ReportedDate
        };
    }
}