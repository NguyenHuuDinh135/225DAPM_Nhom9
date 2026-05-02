using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace backend.Application.TreeIncidents.Commands.CreateIncident;

public class IncidentCreationService(
    IApplicationDbContext context,
    IFileService fileService,
    INotificationService notificationService,
    IAIService aiService,
    IAutoAssignmentService autoAssignmentService) : IIncidentCreationService
{
    public async Task<Result<int>> CreateAsync(
        int treeId,
        string? reporterId,
        string? content,
        string? reporterName,
        string? reporterPhone,
        List<IFormFile>? images,
        CancellationToken cancellationToken)
    {
        // AI Triage
        string severity = "Bình thường";
        try
        {
            severity = await aiService.AnalyzeIncidentSeverityAsync(content ?? "");
        }
        catch { }

        try
        {
            var incident = TreeIncident.Create(treeId, reporterId, content, reporterName, reporterPhone, severity);

            if (images is not null)
            {
                foreach (var file in images)
                {
                    try
                    {
                        var path = await fileService.UploadAsync(file, "incidents");
                        incident.AddImage(new TreeIncidentImage { Path = path });
                    }
                    catch { }
                }
            }

            context.TreeIncidents.Add(incident);
            await context.SaveChangesAsync(cancellationToken);

            // Auto-Emergency Response
            if (severity == "Khẩn cấp")
            {
                try
                {
                    // 1. Tìm hoặc tạo WorkType cho sự cố khẩn cấp
                    var workType = await context.WorkTypes.FirstOrDefaultAsync(x => x.Name == "Xử lý sự cố khẩn cấp", cancellationToken);
                    if (workType == null)
                    {
                        workType = new WorkType { Name = "Xử lý sự cố khẩn cấp" };
                        context.WorkTypes.Add(workType);
                        await context.SaveChangesAsync(cancellationToken);
                    }

                    // 2. Tìm hoặc tạo một Kế hoạch "Sự cố khẩn cấp" chung
                    var plan = await context.Plans.FirstOrDefaultAsync(x => x.Name == "Xử lý sự cố khẩn cấp", cancellationToken);
                    if (plan == null)
                    {
                        plan = Plan.Create("Hệ thống Xử lý sự cố khẩn cấp", "system", DateTime.UtcNow, DateTime.UtcNow.AddYears(1));
                        plan.SubmitForApproval();
                        plan.Approve("system");
                        context.Plans.Add(plan);
                        await context.SaveChangesAsync(cancellationToken);
                    }

                    // 3. Tạo Work
                    var work = Work.Create(workType.Id, plan.Id, "system", DateTime.UtcNow, DateTime.UtcNow.AddDays(1));
                    context.Works.Add(work);

                    var tree = await context.Trees.FindAsync(new object[] { treeId }, cancellationToken);
                    var workDetail = new WorkDetail
                    {
                        Work = work,
                        TreeId = treeId,
                        Content = $"[KHẨN CẤP] {content}",
                        Status = "New"
                    };
                    context.WorkDetails.Add(workDetail);
                    await context.SaveChangesAsync(cancellationToken);

                    // 4. Tự động phân công
                    await autoAssignmentService.AssignEmergencyWorkAsync(work.Id, tree?.Latitude, tree?.Longitude, cancellationToken);

                    await notificationService.SendNotificationAsync(
                        "SỰ CỐ KHẨN CẤP",
                        $"Hệ thống đã tự động tạo và phân công việc xử lý sự cố #{incident.Id} mức độ nghiêm trọng CAO.",
                        "error"
                    );
                }
                catch (Exception)
                {
                    // Log and continue
                }
            }
            else
            {
                await notificationService.SendIncidentNotificationAsync($"Có sự cố mới: {content}", incident.Id);
            }

            return Result<int>.Success(incident.Id);
        }
        catch (InvalidOperationException ex)
        {
            return Result<int>.Failure(ex.Message);
        }
    }
}
