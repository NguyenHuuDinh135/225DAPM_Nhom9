using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace backend.Application.TreeIncidents.Commands.CreateTreeIncident;

public record CreateTreeIncidentCommand : IRequest<int>
{
    public int TreeId { get; init; }
    public string? Content { get; init; }
    public List<IFormFile>? Images { get; init; }
}

public class CreateTreeIncidentCommandHandler : IRequestHandler<CreateTreeIncidentCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileService _fileService;

    public CreateTreeIncidentCommandHandler(IApplicationDbContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<int> Handle(CreateTreeIncidentCommand request, CancellationToken cancellationToken)
    {
        var entity = TreeIncident.Create(request.TreeId, "system", request.Content);

        if (request.Images != null)
        {
            foreach (var file in request.Images)
            {
                var path = await _fileService.UploadAsync(file, "incidents");
                entity.AddImage(new TreeIncidentImage { Path = path });
            }
        }

        _context.TreeIncidents.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
