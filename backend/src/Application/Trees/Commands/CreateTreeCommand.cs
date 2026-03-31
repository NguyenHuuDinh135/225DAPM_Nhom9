using MediatR;

namespace backend.Application.Trees.Commands
{
    public class CreateTreeCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
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
                Type = request.Type,
                Location = request.Location
            };

            _context.Trees.Add(tree);
            await _context.SaveChangesAsync(cancellationToken);

            return tree.Id;
        }
    }
}