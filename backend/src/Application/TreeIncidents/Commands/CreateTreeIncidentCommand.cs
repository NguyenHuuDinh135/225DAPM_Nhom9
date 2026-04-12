using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;

namespace backend.Application.TreeIncidents.Commands
{
    public class CreateTreeIncidentCommand : IRequest<int>
    {
        public int TreeId { get; set; }
        public string? Content { get; set; }
        public string ReporterId { get; set; } = string.Empty;
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
                Content = request.Content,
                ReporterId = request.ReporterId,
                ReportedDate = DateTime.UtcNow,
                Status = "Open"
            };

            _context.TreeIncidents.Add(incident);
            await _context.SaveChangesAsync(cancellationToken);

            return incident.Id;
        }
    }
}
