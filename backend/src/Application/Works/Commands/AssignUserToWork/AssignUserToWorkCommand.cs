using backend.Domain.Entities;

namespace backend.Application.Works.Commands.AssignUserToWork;

public record AssignUserToWorkCommand : IRequest<IStatusResult>
{
    public int WorkId { get; init; }
    public string UserId { get; init; } = string.Empty;
    public string? Role { get; init; }
}

public class AssignUserToWorkCommandValidator : AbstractValidator<AssignUserToWorkCommand>
{
    public AssignUserToWorkCommandValidator()
    {
        RuleFor(x => x.WorkId).GreaterThan(0);
        RuleFor(x => x.UserId).NotEmpty();
    }
}

public class AssignUserToWorkCommandHandler : IRequestHandler<AssignUserToWorkCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public AssignUserToWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(AssignUserToWorkCommand request, CancellationToken cancellationToken)
    {
        var workExists = await _context.Works.AnyAsync(w => w.Id == request.WorkId, cancellationToken);
        if (!workExists)
            return StatusResult.Failure($"Work {request.WorkId} not found.");

        var workUser = new WorkUser
        {
            WorkId = request.WorkId,
            UserId = request.UserId,
            Role = request.Role ?? "Người thực hiện",
            Status = "Assigned"
        };

        _context.WorkUsers.Add(workUser);
        await _context.SaveChangesAsync(cancellationToken);

        return StatusResult.Success();
    }
}
