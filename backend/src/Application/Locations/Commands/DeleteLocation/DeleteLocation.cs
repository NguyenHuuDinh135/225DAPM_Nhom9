namespace backend.Application.Locations.Commands.DeleteLocation;

public record DeleteLocationCommand(int Id) : IRequest;

public class DeleteLocationCommandHandler : IRequestHandler<DeleteLocationCommand>
{
    private readonly IApplicationDbContext _context;

    public DeleteLocationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteLocationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Locations
            .Where(l => l.Id == request.Id)
            .SingleOrDefaultAsync(cancellationToken);

        Guard.Against.NotFound(request.Id, entity);

        _context.Locations.Remove(entity);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
