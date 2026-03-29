using MediatR;

namespace backend.Application.Trees.Queries
{
    public class GetTreesQuery : IRequest<List<TreeDto>>
    {
    }

    public class GetTreesQueryHandler : IRequestHandler<GetTreesQuery, List<TreeDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetTreesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<TreeDto>> Handle(GetTreesQuery request, CancellationToken cancellationToken)
        {
            return await _context.Trees
                .Select(tree => new TreeDto
                {
                    Id = tree.Id,
                    Name = tree.Name,
                    Type = tree.Type,
                    Location = tree.Location
                })
                .ToListAsync(cancellationToken);
        }
    }

    public class TreeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}