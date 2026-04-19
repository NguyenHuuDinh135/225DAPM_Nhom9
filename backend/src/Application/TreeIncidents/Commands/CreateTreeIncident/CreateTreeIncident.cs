namespace backend.Application.TreeIncidents.Commands.CreateTreeIncident;

public record CreateTreeIncidentCommand : IRequest<Guid>
{
    public Guid TreeId { get; init; }
    public string? Description { get; init; }
    public double Latitude { get; init; }
    public double Longitude { get; init; }
    // Danh sách file ảnh gửi từ Client
    public List<IFormFile>? Images { get; init; }
}

public class CreateTreeIncidentCommandHandler : IRequestHandler<CreateTreeIncidentCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileService _fileService; // Bạn cần tạo interface này ở Infrastructure

    public CreateTreeIncidentCommandHandler(IApplicationDbContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<Guid> Handle(CreateTreeIncidentCommand request, CancellationToken cancellationToken)
    {
        var entity = new TreeIncident
        {
            TreeId = request.TreeId,
            Description = request.Description,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Status = IncidentStatus.Pending,
            ReportedDate = DateTime.Now
        };

        if (request.Images != null)
        {
            foreach (var file in request.Images)
            {
                // Lưu ảnh vào thư mục wwwroot/uploads/incidents
                var path = await _fileService.UploadAsync(file, "incidents");
                entity.Images.Add(new TreeIncidentImage { ImageUrl = path });
            }
        }

        _context.TreeIncidents.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
