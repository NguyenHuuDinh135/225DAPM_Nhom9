using backend.Application.Common.Interfaces;
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
                    Condition = tree.Condition,
                    TreeTypeId = tree.TreeTypeId,
                    RecordedDate = tree.RecordedDate
                })
                .ToListAsync(cancellationToken);
        }
    }

    public class TreeDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Condition { get; set; }
        public int TreeTypeId { get; set; }
        public DateTime? RecordedDate { get; set; }
    }
}
