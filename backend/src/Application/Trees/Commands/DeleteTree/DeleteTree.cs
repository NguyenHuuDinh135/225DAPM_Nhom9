using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Commands.DeleteTree;

public record DeleteTreeCommand(int Id) : IRequest<Result>;

public class DeleteTreeCommandHandler : IRequestHandler<DeleteTreeCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteTreeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees
            .Include(t => t.TreeLocationHistories)
            .Include(t => t.TreeIncidents)
            .Include(t => t.WorkDetails)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (tree is null)
            return Result.Failure($"Tree {request.Id} not found.");

        if (tree.TreeIncidents.Any() || tree.WorkDetails.Any())
        {
            return Result.Failure("Không thể xóa cây này vì đang có dữ liệu sự cố hoặc công việc bảo trì liên quan. Vui lòng kiểm tra lại.");
        }

        // Xóa lịch sử vị trí trước khi xóa cây
        if (tree.TreeLocationHistories.Any())
        {
            _context.TreeLocationHistories.RemoveRange(tree.TreeLocationHistories);
        }

        _context.Trees.Remove(tree);
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
