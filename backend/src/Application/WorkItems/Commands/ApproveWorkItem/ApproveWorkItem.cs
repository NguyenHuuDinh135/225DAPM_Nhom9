using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.WorkItems.Commands.ApproveWorkItem;

public record ApproveWorkItemCommand : IRequest<IStatusResult>
{
    public int WorkItemId { get; init; }
    public bool IsApproved { get; init; }
    public string? Feedback { get; init; }
}

public class ApproveWorkItemCommandHandler : IRequestHandler<ApproveWorkItemCommand, IStatusResult>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public ApproveWorkItemCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<IStatusResult> Handle(ApproveWorkItemCommand request, CancellationToken cancellationToken)
    {
        var work = await _context.Works.FindAsync([request.WorkItemId], cancellationToken);
        if (work is null)
            return StatusResult.Failure("Work item not found.");

        if (request.IsApproved)
        {
            work.Complete();
            await _context.SaveChangesAsync(cancellationToken);
            await _notificationService.SendIncidentNotificationAsync(
                $"Công việc #{work.Id} đã được duyệt và hoàn thành.", work.Id);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.Feedback))
                return StatusResult.Failure("Feedback is required when rejecting.");

            work.Reject(request.Feedback);
            await _context.SaveChangesAsync(cancellationToken);
            await _notificationService.SendIncidentNotificationAsync(
                $"Công việc #{work.Id} bị từ chối: {request.Feedback}", work.Id);
        }

        return StatusResult.Success();
    }
}
