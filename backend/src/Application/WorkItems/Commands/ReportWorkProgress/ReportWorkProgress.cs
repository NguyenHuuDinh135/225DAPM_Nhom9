using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace backend.Application.WorkItems.Commands.ReportWorkProgress;

public record ReportWorkProgressCommand : IRequest<Result>
{
    public int WorkItemId { get; init; }
    public List<IFormFile> Images { get; init; } = [];
    public string? Note { get; init; }
    public string UpdaterId { get; init; } = string.Empty;
    public int? Percentage { get; init; }
}

public class ReportWorkProgressCommandHandler(
    IApplicationDbContext context, 
    IFileService fileService,
    IAIService aiService,
    INotificationService notificationService) : IRequestHandler<ReportWorkProgressCommand, Result>
{
    public async Task<Result> Handle(ReportWorkProgressCommand request, CancellationToken cancellationToken)
    {
        var work = await context.Works
            .Include(w => w.WorkType)
            .Include(w => w.Plan)
            .FirstOrDefaultAsync(w => w.Id == request.WorkItemId, cancellationToken);

        if (work is null)
            return Result.Failure("Work item not found.");

        try
        {
            var progress = new WorkProgress
            {
                WorkId = work.Id,
                UpdaterId = request.UpdaterId,
                Note = request.Note,
                Percentage = request.Percentage,
                UpdatedDate = DateTime.UtcNow
            };

            string lastPath = "";
            foreach (var file in request.Images)
            {
                var path = await fileService.UploadAsync(file, "work-progress");
                progress.Images.Add(new WorkProgressImage { Path = path });
                lastPath = path;
            }

            context.WorkProgresses.Add(progress);

            if (work.Status == WorkStatus.New)
            {
                work.Start();
            }

            // AI Image Verification
            bool aiVerified = false;
            if (!string.IsNullOrEmpty(lastPath))
            {
                try
                {
                    aiVerified = await aiService.VerifyWorkCompletionAsync(work.WorkType.Name, lastPath);
                }
                catch { }
            }

            if (aiVerified && request.Percentage == 100)
            {
                work.Complete();
                await notificationService.SendNotificationAsync(
                    "Nghiệm thu tự động (AI)",
                    $"Công tác '{work.WorkType.Name}' đã được AI xác nhận hoàn thành dựa trên hình ảnh.",
                    "success"
                );
            }
            else if (request.Percentage == 100)
            {
                work.SubmitForApproval();
            }
            // else: Just a progress report, stay InProgress (already started above)

            await context.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
