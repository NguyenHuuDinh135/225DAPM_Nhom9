using backend.Domain.Constants;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Identity;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace backend.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public ApplicationDbContextInitialiser(ILogger<ApplicationDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            _logger.LogInformation("Bắt đầu khởi tạo Database...");
            await _context.Database.EnsureDeletedAsync();
            await _context.Database.EnsureCreatedAsync();
            _logger.LogInformation("Khởi tạo Database thành công.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi khởi tạo database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Bắt đầu Seed dữ liệu quản lý cây xanh Hải Châu...");
            await TrySeedAsync();
            _logger.LogInformation("✅ Seed dữ liệu thành công (10 records mỗi bảng).");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed dữ liệu.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        var rand = new Random();
        var admin = await GetOrCreateAdminUser();

        // ==================== 1. TreeType ====================
        if (!_context.TreeTypes.Any())
        {
            var treeTypes = new List<TreeType>
            {
                new TreeType { Name = "Xà Cừ", Group = "Cây bóng mát" },
                new TreeType { Name = "Phượng Vĩ", Group = "Cây hoa" },
                new TreeType { Name = "Bàng", Group = "Cây bóng mát" },
                new TreeType { Name = "Sấu", Group = "Cây ăn quả" },
                new TreeType { Name = "Bồ Đề", Group = "Cây bóng mát" },
                new TreeType { Name = "Me", Group = "Cây ăn quả" },
                new TreeType { Name = "Sao", Group = "Cây gỗ lớn" },
                new TreeType { Name = "Dừa", Group = "Cây ăn quả" },
                new TreeType { Name = "Hoa Sữa", Group = "Cây bóng mát" },
                new TreeType { Name = "Lim Xanh", Group = "Cây gỗ lớn" }
            };
            _context.TreeTypes.AddRange(treeTypes);
            await _context.SaveChangesAsync();
        }

        // ==================== 2. Ward ====================
        if (!_context.Wards.Any())
        {
            var wards = new List<Ward>
            {
                new Ward { Name = "Hải Châu I" }, new Ward { Name = "Hải Châu II" },
                new Ward { Name = "Thạch Thang" }, new Ward { Name = "Thanh Bình" },
                new Ward { Name = "Nam Dương" }, new Ward { Name = "Bình Hiên" },
                new Ward { Name = "Hòa Thuận Tây" }, new Ward { Name = "Hòa Thuận Đông" },
                new Ward { Name = "Hòa Cường Bắc" }, new Ward { Name = "Hòa Cường Nam" }
            };
            _context.Wards.AddRange(wards);
            await _context.SaveChangesAsync();
        }

        // ==================== 3. Street ====================
        if (!_context.Streets.Any())
        {
            var streets = new List<Street>
            {
                new Street { Name = "Nguyễn Văn Linh", WardId = 1 },
                new Street { Name = "Trần Phú", WardId = 2 },
                new Street { Name = "Phan Chu Trinh", WardId = 3 },
                new Street { Name = "Bạch Đằng", WardId = 4 },
                new Street { Name = "Hùng Vương", WardId = 5 },
                new Street { Name = "Hải Phòng", WardId = 6 },
                new Street { Name = "Lê Duẩn", WardId = 7 },
                new Street { Name = "Ông Ích Khiêm", WardId = 8 },
                new Street { Name = "Châu Thị Vĩnh Tế", WardId = 9 },
                new Street { Name = "Nguyễn Thị Minh Khai", WardId = 10 }
            };
            _context.Streets.AddRange(streets);
            await _context.SaveChangesAsync();
        }

        // ==================== 4. Location ====================
        if (!_context.Locations.Any())
        {
            var locations = new List<Location>
            {
                new Location { StreetId = 1, HouseNumber = 120, Latitude = 16.0602m, Longitude = 108.2210m, Description = "Công viên Nguyễn Văn Linh" },
                new Location { StreetId = 2, HouseNumber = 45,  Latitude = 16.0585m, Longitude = 108.2187m, Description = "Trước trụ sở UBND" },
                new Location { StreetId = 3, HouseNumber = null, Latitude = 16.0621m, Longitude = 108.2254m, Description = "Gần chùa Phước Ninh" },
                new Location { StreetId = 4, HouseNumber = 78,  Latitude = 16.0558m, Longitude = 108.2301m, Description = "Bờ sông Hàn" },
                new Location { StreetId = 5, HouseNumber = 210, Latitude = 16.0597m, Longitude = 108.2123m, Description = "Trung tâm hành chính" },
                new Location { StreetId = 6, HouseNumber = null, Latitude = 16.0634m, Longitude = 108.2198m, Description = "Công viên 29/3" },
                new Location { StreetId = 7, HouseNumber = 156, Latitude = 16.0579m, Longitude = 108.2265m, Description = "Khu dân cư Hòa Thuận" },
                new Location { StreetId = 8, HouseNumber = 89,  Latitude = 16.0615m, Longitude = 108.2147m, Description = "Gần cầu Rồng" },
                new Location { StreetId = 9, HouseNumber = 67,  Latitude = 16.0582m, Longitude = 108.2239m, Description = "Trường THPT Phan Chu Trinh" },
                new Location { StreetId = 10, HouseNumber = 134, Latitude = 16.0648m, Longitude = 108.2172m, Description = "Chợ Hàn" }
            };
            _context.Locations.AddRange(locations);
            await _context.SaveChangesAsync();
        }

        // ==================== 5. Tree ====================
        if (!_context.Trees.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.Trees.Add(new Tree
                {
                    TreeTypeId = rand.Next(1, 11),
                    Name = $"Cây xanh Hải Châu {i}",
                    Condition = rand.Next(0, 3) == 0 ? "Yếu" : "Tốt",
                    Height = decimal.Round(7m + (decimal)(rand.NextDouble() * 18), 1),
                    TrunkDiameter = decimal.Round(25m + (decimal)(rand.NextDouble() * 35), 1),
                    RecordedDate = DateTime.UtcNow.AddMonths(-rand.Next(1, 24))
                });
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 6. Plan ====================
        if (!_context.Plans.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.Plans.Add(Plan.Create(
                    $"Kế hoạch chăm sóc cây xanh quý {i % 4 + 1}/2026",
                    admin.Id,
                    DateTime.UtcNow.AddMonths(-rand.Next(0, 6)),
                    DateTime.UtcNow.AddMonths(rand.Next(6, 12))));
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 7. WorkType ====================
        if (!_context.WorkTypes.Any())
        {
            var workTypes = new List<WorkType>
            {
                new WorkType { Name = "Trồng cây mới" },
                new WorkType { Name = "Cắt tỉa cành" },
                new WorkType { Name = "Tưới nước & bón phân" },
                new WorkType { Name = "Xử lý sâu bệnh" },
                new WorkType { Name = "Thay thế cây chết" },
                new WorkType { Name = "Kiểm tra định kỳ" },
                new WorkType { Name = "Xử lý cây nguy hiểm" },
                new WorkType { Name = "Lắp biển báo" },
                new WorkType { Name = "Vệ sinh gốc cây" },
                new WorkType { Name = "Theo dõi tăng trưởng" }
            };
            _context.WorkTypes.AddRange(workTypes);
            await _context.SaveChangesAsync();
        }

        // ==================== 8. Work ====================
        if (!_context.Works.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.Works.Add(Work.Create(
                    rand.Next(1, 11),
                    rand.Next(1, 11),
                    admin.Id,
                    DateTime.UtcNow.AddDays(-rand.Next(5, 30)),
                    DateTime.UtcNow.AddDays(rand.Next(10, 45))));
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 9. WorkDetail ====================
        if (!_context.WorkDetails.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.WorkDetails.Add(new WorkDetail
                {
                    WorkId = i,
                    TreeId = rand.Next(1, 11),
                    NewLocationId = rand.Next(1, 11),
                    Content = $"Thực hiện công việc {i} cho cây xanh",
                    Status = "Completed"
                });
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 10. WorkProgress ====================
        if (!_context.WorkProgresses.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.WorkProgresses.Add(new WorkProgress
                {
                    WorkId = i,
                    UpdaterId = admin.Id,
                    Percentage = rand.Next(70, 101),
                    Note = "Đã hoàn thành tốt",
                    UpdatedDate = DateTime.UtcNow.AddDays(-rand.Next(0, 8))
                });
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 11. WorkUser ====================
        if (!_context.WorkUsers.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.WorkUsers.Add(new WorkUser
                {
                    WorkId = i,
                    UserId = admin.Id,
                    Role = "Người thực hiện",
                    Status = "Assigned"
                });
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 12. TreeIncident ====================
        if (!_context.TreeIncidents.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                var incident = TreeIncident.Create(rand.Next(1, 11), admin.Id, $"Cây có dấu hiệu sâu bệnh / gãy cành {i}");
                incident.UpdateStatus("Resolved");
                _context.TreeIncidents.Add(incident);
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 13. TreeIncidentImage ====================
        if (!_context.TreeIncidentImages.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.TreeIncidentImages.Add(new TreeIncidentImage
                {
                    TreeIncidentId = i,
                    Path = $"/uploads/incidents/incident-{i}.jpg",
                    Description = $"Hình ảnh sự cố cây số {i}"
                });
            }
            await _context.SaveChangesAsync();
        }

        // ==================== 14. TreeLocationHistory ====================
        if (!_context.TreeLocationHistories.Any())
        {
            for (int i = 1; i <= 10; i++)
            {
                _context.TreeLocationHistories.Add(new TreeLocationHistory
                {
                    TreeId = rand.Next(1, 11),
                    LocationId = rand.Next(1, 11),
                    FromDate = DateTime.UtcNow.AddMonths(-rand.Next(6, 18)),
                    ToDate = DateTime.UtcNow.AddMonths(-rand.Next(1, 6))
                });
            }
            await _context.SaveChangesAsync();
        }
    }

    private async Task<ApplicationUser> GetOrCreateAdminUser()
    {
        var admin = await _userManager.FindByEmailAsync("administrator@localhost");
        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = "administrator@localhost",
                Email = "administrator@localhost",
                FullName = "Nguyễn Văn Admin"
            };

            await _userManager.CreateAsync(admin, "Administrator1!");
            var adminRole = new IdentityRole(Roles.Administrator);
            if (!await _roleManager.RoleExistsAsync(Roles.Administrator))
                await _roleManager.CreateAsync(adminRole);

            await _userManager.AddToRoleAsync(admin, Roles.Administrator);
        }
        return admin;
    }
}
