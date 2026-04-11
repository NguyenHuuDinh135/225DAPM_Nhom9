using MediatR;

namespace backend.Application.TreeIncidents.Commands
{
    public class CreateTreeIncidentCommand : IRequest<int>
    {
        public int TreeId { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime DateReported { get; set; }
    }

    public class CreateTreeIncidentCommandHandler : IRequestHandler<CreateTreeIncidentCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreateTreeIncidentCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateTreeIncidentCommand request, CancellationToken cancellationToken)
        {
            var incident = new TreeIncident
            {
                TreeId = request.TreeId,
                Description = request.Description,
                DateReported = request.DateReported
            };

            _context.TreeIncidents.Add(incident);
            await _context.SaveChangesAsync(cancellationToken);

            return incident.Id;
        }
    }
}