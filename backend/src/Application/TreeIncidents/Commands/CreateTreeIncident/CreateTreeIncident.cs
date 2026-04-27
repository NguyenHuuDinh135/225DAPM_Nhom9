using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace backend.Application.TreeIncidents.Commands.CreateTreeIncident;

public record CreateTreeIncidentCommand : IRequest<int>
{
    public int TreeId { get; init; }
    public string? Content { get; init; }
    public string? ReporterName { get; init; }
    public string? ReporterPhone { get; init; }
    public List<IFormFile>? Images { get; init; }
}

public class CreateTreeIncidentCommandHandler : IRequestHandler<CreateTreeIncidentCommand, int>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileService _fileService;
    private readonly INotificationService _notificationService;
    private readonly IUser _user;

    public CreateTreeIncidentCommandHandler(
        IApplicationDbContext context,
        IFileService fileService,
        INotificationService notificationService,
        IUser user)
    {
        _context = context;
        _fileService = fileService;
        _notificationService = notificationService;
        _user = user;
    }

    public async Task<int> Handle(CreateTreeIncidentCommand request, CancellationToken cancellationToken)
    {
        var reporterId = _user.Id;
        if (string.IsNullOrWhiteSpace(reporterId))
        {
            throw new UnauthorizedAccessException("Bạn cần đăng nhập để gửi báo cáo sự cố.");
        }

        var entity = TreeIncident.Create(
            request.TreeId,
            reporterId,
            request.Content,
            request.ReporterName,
            request.ReporterPhone);

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

        await _notificationService.SendIncidentNotificationAsync("Có sự cố mới được báo cáo!", entity.Id);

        return entity.Id;
    }
}
