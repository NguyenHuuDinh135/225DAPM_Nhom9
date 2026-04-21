using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace backend.Application.WorkItems.Commands.ReportWorkProgress;

public record ReportWorkProgressCommand : IRequest<IStatusResult>
{
    public int WorkItemId { get; init; }
    public List<IFormFile> Images { get; init; } = [];
    public string? Note { get; init; }
    public string UpdaterId { get; init; } = string.Empty;
    public int? Percentage { get; init; }
}

public class ReportWorkProgressCommandHandler : IRequestHandler<ReportWorkProgressCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileService _fileService;

    public ReportWorkProgressCommandHandler(IApplicationDbContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    public async Task<IStatusResult> Handle(ReportWorkProgressCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.WorkItemId], cancellationToken);
        if (work is null)
            return StatusResult.Failure("Work item not found.");

        var progress = new WorkProgress
        {
            WorkId = work.Id,
            UpdaterId = request.UpdaterId,
            Note = request.Note,
            Percentage = request.Percentage,
            UpdatedDate = DateTime.UtcNow
        };

        foreach (var file in request.Images)
        {
            var path = await _fileService.UploadAsync(file, "work-progress");
            progress.Images.Add(new WorkProgressImage { Path = path });
        }

        _context.WorkProgresses.Add(progress);

        work.SubmitForApproval();

        await _context.SaveChangesAsync(cancellationToken);
        return StatusResult.Success();
    }
}
