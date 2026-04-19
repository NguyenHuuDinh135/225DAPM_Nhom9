using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Services;

/// <summary>
/// Triển khai service định kỳ cho việc kiểm tra và tạo công việc bảo dưỡng cây xanh.
/// </summary>
public class MaintenanceJobService : IMaintenanceJobService
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ILogger<MaintenanceJobService> _logger;

    public MaintenanceJobService(IApplicationDbContext dbContext, ILogger<MaintenanceJobService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Kiểm tra các cây xanh cần bảo dưỡng dựa trên khoảng thời gian định kỳ.
    /// Tạo công việc bảo dưỡng cho những cây quá hạn.
    /// </summary>
    public async Task CheckAndGenerateMaintenanceWorkAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Bắt đầu kiểm tra cây xanh cần bảo dưỡng.");

            var maintenanceWorkType = await _dbContext.WorkTypes
                .FirstOrDefaultAsync(x => x.Name == "Bảo dưỡng định kỳ", cancellationToken);

            var maintenancePlan = await _dbContext.Plans
                .FirstOrDefaultAsync(x => x.Name == "Kế hoạch bảo dưỡng tự động", cancellationToken);

            if (maintenanceWorkType is null || maintenancePlan is null)
            {
                throw new InvalidOperationException("Maintenance metadata is missing.");
            }

            var now = DateTime.UtcNow;
            var allTrees = await _dbContext.Trees
                .Include(t => t.TreeType)
                .Where(tree => tree.TreeType != null)
                .ToListAsync(cancellationToken);

            var dueTrees = allTrees.Where(tree => tree.NeedsMaintenance(now)).ToList();

            foreach (var tree in dueTrees)
            {
                var work = new Work
                {
                    WorkTypeId = maintenanceWorkType.Id,
                    WorkType = maintenanceWorkType,
                    PlanId = maintenancePlan.Id,
                    Plan = maintenancePlan,
                    CreatorId = "system",
                    CreatedDate = now,
                    Status = WorkStatus.New
                };

                _dbContext.Works.Add(work);

                var workDetail = new WorkDetail
                {
                    Work = work,
                    WorkId = work.Id,
                    TreeId = tree.Id,
                    Tree = tree,
                    Content = "Bảo dưỡng định kỳ cây xanh",
                    Status = "New"
                };

                _dbContext.WorkDetails.Add(workDetail);
                tree.UpdateLastMaintenanceDate(now);
            }

            if (dueTrees.Any())
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }

            _logger.LogInformation("Hoàn thành kiểm tra cây xanh cần bảo dưỡng.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi kiểm tra và tạo công việc bảo dưỡng.");
            throw;
        }
    }
}
