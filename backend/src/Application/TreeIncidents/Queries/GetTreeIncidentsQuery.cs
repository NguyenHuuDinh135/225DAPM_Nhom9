using backend.Application.Common.Interfaces;
using MediatR;

namespace backend.Application.TreeIncidents.Queries
{
    public class GetTreeIncidentsQuery : IRequest<List<TreeIncidentDto>>
    {
    }

    public class GetTreeIncidentsQueryHandler : IRequestHandler<GetTreeIncidentsQuery, List<TreeIncidentDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetTreeIncidentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TreeIncidentDto>> Handle(GetTreeIncidentsQuery request, CancellationToken cancellationToken)
        {
            return await _context.TreeIncidents
                .Select(incident => new TreeIncidentDto
                {
                    Id = incident.Id,
                    TreeId = incident.TreeId,
                    Content = incident.Content,
                    Status = incident.Status,
                    ReportedDate = incident.ReportedDate
                })
                .ToListAsync(cancellationToken);
        }
    }

    public class TreeIncidentDto
    {
        public int Id { get; set; }
        public int TreeId { get; set; }
        public string? Content { get; set; }
        public string? Status { get; set; }
        public DateTime? ReportedDate { get; set; }
    }
}