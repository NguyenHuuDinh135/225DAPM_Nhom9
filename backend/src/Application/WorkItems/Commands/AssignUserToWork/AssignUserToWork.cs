using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;

namespace backend.Application.WorkItems.Commands.AssignUserToWork;

public record AssignUserToWorkCommand : IRequest<Result>
{
    public int WorkId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string? Role { get; init; }
}

public class AssignUserToWorkCommandHandler : IRequestHandler<AssignUserToWorkCommand, Result>
{
    private readonly IApplicationDbContext _context;
    public AssignUserToWorkCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(AssignUserToWorkCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.WorkId], cancellationToken);
        if (work is null) return Result.Failure("Work not found.");
        _context.WorkUsers.Add(new WorkUser { WorkId = request.WorkId, UserId = request.UserId, Role = request.Role });
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
