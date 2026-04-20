using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Commands.UpdateTree;

public record UpdateTreeCommand : IRequest<IStatusResult>
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Condition { get; init; }
    public decimal? Height { get; init; }
    public decimal? TrunkDiameter { get; init; }
}

public class UpdateTreeCommandValidator : AbstractValidator<UpdateTreeCommand>
{
    public UpdateTreeCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

public class UpdateTreeCommandHandler : IRequestHandler<UpdateTreeCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;

    public UpdateTreeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IStatusResult> Handle(UpdateTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees.FindAsync([request.Id], cancellationToken);
        if (tree is null)
            return StatusResult.Failure($"Tree {request.Id} not found.");

        tree.Name = request.Name;
        tree.Condition = request.Condition;
        tree.Height = request.Height;
        tree.TrunkDiameter = request.TrunkDiameter;

        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
