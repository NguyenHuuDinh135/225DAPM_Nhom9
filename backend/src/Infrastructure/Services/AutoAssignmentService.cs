using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Services;

public class AutoAssignmentService : IAutoAssignmentService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AutoAssignmentService> _logger;
    private readonly INotificationService _notificationService;

    public AutoAssignmentService(
        ApplicationDbContext context, 
        ILogger<AutoAssignmentService> logger,
        INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    public async Task<Result> AssignEmergencyWorkAsync(int workId, double? latitude, double? longitude, CancellationToken cancellationToken = default)
    {
        try
        {
            // Tìm nhân viên rảnh nhất hệ thống (hoặc có thể lọc theo WardId nếu cần)
            var bestCandidate = await _context.Users
                .Where(u => _context.UserRoles.Any(ur => ur.UserId == u.Id)) // Chỉ lấy user có role (đơn giản hóa)
                .Select(u => new 
                {
                    User = u,
                    ActiveWorkCount = _context.WorkUsers.Count(wu => wu.UserId == u.Id && wu.Work.Status != WorkStatus.Completed)
                })
                .OrderBy(x => x.ActiveWorkCount)
                .FirstOrDefaultAsync(cancellationToken);

            if (bestCandidate == null)
            {
                _logger.LogWarning("Không tìm thấy nhân viên nào để gán việc khẩn cấp cho Work #{WorkId}", workId);
                return Result.Failure("No available employee found.");
            }

            _context.WorkUsers.Add(new WorkUser 
            { 
                WorkId = workId, 
                UserId = bestCandidate.User.Id, 
                Role = "Emergency Responder" 
            });

            await _context.SaveChangesAsync(cancellationToken);

            await _notificationService.SendNotificationAsync(
                "SỰ CỐ KHẨN CẤP",
                $"Bạn đã được hệ thống tự động gán xử lý sự cố khẩn cấp #{workId}.",
                "error"
            );

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi phân công việc khẩn cấp #{WorkId}", workId);
            return Result.Failure("Internal error during emergency assignment.");
        }
    }

    public async Task<Result> AssignStandardWorksAsync(IEnumerable<int> workIds, string captainId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Lấy danh sách nhân viên rảnh của Đội trưởng này (giả định tất cả NhanVien là ứng viên)
            var employees = await _context.Users
                .Select(u => new 
                {
                    User = u,
                    ActiveWorkCount = _context.WorkUsers.Count(wu => wu.UserId == u.Id && wu.Work.Status != WorkStatus.Completed)
                })
                .OrderBy(x => x.ActiveWorkCount)
                .ToListAsync(cancellationToken);

            if (!employees.Any()) return Result.Failure("No employees available.");

            int empIndex = 0;
            foreach (var workId in workIds)
            {
                var candidate = employees[empIndex % employees.Count];
                _context.WorkUsers.Add(new WorkUser 
                { 
                    WorkId = workId, 
                    UserId = candidate.User.Id, 
                    Role = "Maintenance Staff" 
                });
                empIndex++;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi phân công định kỳ.");
            return Result.Failure("Internal error during auto-assignment.");
        }
    }
}
