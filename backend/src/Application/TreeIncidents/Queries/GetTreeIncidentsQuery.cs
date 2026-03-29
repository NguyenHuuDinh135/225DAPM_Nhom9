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
                    Description = incident.Description,
                    DateReported = incident.DateReported
                })
                .ToListAsync(cancellationToken);
        }
    }

    public class TreeIncidentDto
    {
        public int Id { get; set; }
        public int TreeId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DateReported { get; set; }
    }
}