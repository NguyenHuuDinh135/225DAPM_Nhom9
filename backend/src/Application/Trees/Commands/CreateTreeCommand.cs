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
                RecordedDate = DateTime.UtcNow
            };

            _context.Trees.Add(tree);
            await _context.SaveChangesAsync(cancellationToken);

            return tree.Id;
        }
    }
}