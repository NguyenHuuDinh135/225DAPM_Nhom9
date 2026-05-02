using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace backend.Application.Planning.Commands.CreatePlan;

public record CreatePlanCommand : IRequest<Result<int>>
{
    public string? Name { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public List<int>? AutoAssignTreeIds { get; init; }
    public List<WorkItemCreationDto>? WorkItems { get; init; }
}

public record WorkItemCreationDto
{
    public int WorkTypeId { get; init; }
    public List<int> TreeIds { get; init; } = [];
    public List<string> UserIds { get; init; } = [];
    public string? Content { get; init; }
}

public class CreatePlanCommandValidator : AbstractValidator<CreatePlanCommand>
{
    public CreatePlanCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.CreatorId).NotEmpty();
    }
}

public class CreatePlanCommandHandler : IRequestHandler<CreatePlanCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IAutoAssignmentService _autoAssignmentService;
    private readonly ILogger<CreatePlanCommandHandler> _logger;

    public CreatePlanCommandHandler(
        IApplicationDbContext context, 
        INotificationService notificationService, 
        IAutoAssignmentService autoAssignmentService,
        ILogger<CreatePlanCommandHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _autoAssignmentService = autoAssignmentService;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(CreatePlanCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var plan = Plan.Create(request.Name!, request.CreatorId, request.StartDate, request.EndDate);

            _context.Plans.Add(plan);
            await _context.SaveChangesAsync(cancellationToken);

            // Xử lý tạo thủ công các WorkItems nếu có
            if (request.WorkItems != null && request.WorkItems.Any())
            {
                foreach (var item in request.WorkItems)
                {
                    var work = Work.Create(item.WorkTypeId, plan.Id, request.CreatorId, request.StartDate, request.EndDate);
                    _context.Works.Add(work);

                    foreach (var treeId in item.TreeIds)
                    {
                        var workDetail = new WorkDetail
                        {
                            Work = work,
                            TreeId = treeId,
                            Content = item.Content ?? $"Thực hiện {item.WorkTypeId} theo kế hoạch",
                            Status = "New"
                        };
                        _context.WorkDetails.Add(workDetail);
                    }

                    foreach (var userId in item.UserIds)
                    {
                        var workUser = new WorkUser
                        {
                            Work = work,
                            UserId = userId,
                            Role = "NhanVien",
                            Status = "Assigned"
                        };
                        _context.WorkUsers.Add(workUser);
                    }
                }
                await _context.SaveChangesAsync(cancellationToken);
            }
            // Xử lý gợi ý AI (tự động) nếu có
            else if (request.AutoAssignTreeIds != null && request.AutoAssignTreeIds.Any())
            {
                var workType = await _context.WorkTypes.FirstOrDefaultAsync(x => x.Name == "Kiểm tra định kỳ", cancellationToken);
                var workIds = new List<int>();

                foreach (var treeId in request.AutoAssignTreeIds)
                {
                    var work = Work.Create(workType?.Id ?? 1, plan.Id, request.CreatorId, request.StartDate, request.EndDate);
                    _context.Works.Add(work);
                    
                    var workDetail = new WorkDetail
                    {
                        Work = work,
                        TreeId = treeId,
                        Content = $"Bảo trì định kỳ theo kế hoạch tự động",
                        Status = "New"
                    };
                    _context.WorkDetails.Add(workDetail);
                    workIds.Add(work.Id);
                }

                await _context.SaveChangesAsync(cancellationToken);

                // Gọi service phân công tự động
                try
                {
                    await _autoAssignmentService.AssignStandardWorksAsync(workIds, request.CreatorId, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Lỗi phân công tự động khi tạo kế hoạch {PlanId}", plan.Id);
                }
            }

            await _notificationService.SendNotificationAsync("Kế hoạch mới", $"Kế hoạch '{plan.Name}' đã được tạo.");

            return Result<int>.Success(plan.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo kế hoạch: {Message}", ex.Message);
            return Result<int>.Failure($"Lỗi khi tạo kế hoạch: {ex.Message}");
        }
    }
}
