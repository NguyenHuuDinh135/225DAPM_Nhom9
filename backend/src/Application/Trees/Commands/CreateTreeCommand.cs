using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using MediatR;

namespace backend.Application.Trees.Commands
{
    public class CreateTreeCommand : IRequest<int>
    {
        public string? Name { get; set; }
        public int TreeTypeId { get; set; }
        public string? Condition { get; set; }
        public string? MainImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal? Height { get; set; }
        public decimal? TrunkDiameter { get; set; }
    }

    public class CreateTreeCommandHandler : IRequestHandler<CreateTreeCommand, int>
    {
        private readonly IApplicationDbContext _context;

        public CreateTreeCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateTreeCommand request, CancellationToken cancellationToken)
        {
            var tree = new Tree
            {
                Name = request.Name,
                TreeTypeId = request.TreeTypeId,
                Condition = request.Condition,
                MainImageUrl = request.MainImageUrl,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                Height = request.Height,
                TrunkDiameter = request.TrunkDiameter,
                RecordedDate = DateTime.UtcNow
            };

            _context.Trees.Add(tree);
            await _context.SaveChangesAsync(cancellationToken);

            return tree.Id;
        }
    }
}
