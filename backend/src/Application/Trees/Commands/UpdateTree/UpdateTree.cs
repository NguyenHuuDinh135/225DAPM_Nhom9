using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Trees.Commands.UpdateTree;

public record UpdateTreeCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string? Name { get; init; }
    public string? Condition { get; init; }
    public int TreeTypeId { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    public decimal? Height { get; init; }
    public decimal? TrunkDiameter { get; init; }
    public string? MainImageUrl { get; init; }
}

public class UpdateTreeCommandValidator : AbstractValidator<UpdateTreeCommand>
{
    public UpdateTreeCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.TreeTypeId).GreaterThan(0);
    }
}

public class UpdateTreeCommandHandler : IRequestHandler<UpdateTreeCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateTreeCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(UpdateTreeCommand request, CancellationToken cancellationToken)
    {
        var tree = await _context.Trees.FindAsync([request.Id], cancellationToken);
        if (tree is null)
            return Result.Failure($"Tree {request.Id} not found.");

        tree.Name = request.Name;
        tree.Condition = request.Condition;
        tree.TreeTypeId = request.TreeTypeId;
        tree.Latitude = request.Latitude;
        tree.Longitude = request.Longitude;
        tree.Height = request.Height;
        tree.TrunkDiameter = request.TrunkDiameter;
        tree.MainImageUrl = request.MainImageUrl;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
