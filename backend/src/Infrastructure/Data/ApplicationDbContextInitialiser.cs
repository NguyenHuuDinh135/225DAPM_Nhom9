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
            await _context.Database.EnsureDeletedAsync();
            await _context.Database.EnsureCreatedAsync();
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
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi seed dữ liệu.");
            throw;
        }
    }

    public async Task TrySeedAsync()
    {
        var rand = new Random(42);

        // ── Roles & Users ──────────────────────────────────────────────
        foreach (var role in new[] { Roles.Administrator, Roles.Manager, Roles.Employee })
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

        var admin   = await EnsureUser("admin@localhost",   "Admin1!",    "Nguyễn Văn Admin",      Roles.Administrator);
        var manager = await EnsureUser("manager@localhost", "Manager1!",  "Trần Thị Manager",       Roles.Manager);
        var emp1    = await EnsureUser("emp1@localhost",    "Employee1!", "Lê Văn Nhân Viên",       Roles.Employee);
        var emp2    = await EnsureUser("emp2@localhost",    "Employee1!", "Phạm Thị Công Nhân",     Roles.Employee);
        var emp3    = await EnsureUser("emp3@localhost",    "Employee1!", "Nguyễn Thị Hoa",         Roles.Employee);
        var emp4    = await EnsureUser("emp4@localhost",    "Employee1!", "Trần Văn Bình",          Roles.Employee);
        var emp5    = await EnsureUser("emp5@localhost",    "Employee1!", "Võ Thị Lan",             Roles.Employee);

        var employees = new[] { emp1.Id, emp2.Id, emp3.Id, emp4.Id, emp5.Id };

        // ── 1. Master Data ─────────────────────────────────────────────
        if (!_context.TreeTypes.Any())
        {
            _context.TreeTypes.AddRange(
                new TreeType { Name = "Phượng vĩ",       Group = "Cây hoa",      MaintenanceIntervalDays = 90  },
                new TreeType { Name = "Bàng đài loan",   Group = "Cây bóng mát", MaintenanceIntervalDays = 120 },
                new TreeType { Name = "Muồng hoàng yến", Group = "Cây hoa",      MaintenanceIntervalDays = 90  },
                new TreeType { Name = "Xà cừ",           Group = "Cây bóng mát", MaintenanceIntervalDays = 180 },
                new TreeType { Name = "Lim sẹt",         Group = "Cây gỗ lớn",   MaintenanceIntervalDays = 180 },
                new TreeType { Name = "Sao đen",         Group = "Cây gỗ lớn",   MaintenanceIntervalDays = 180 },
                new TreeType { Name = "Dầu rái",         Group = "Cây bóng mát", MaintenanceIntervalDays = 150 }
            );
            await _context.SaveChangesAsync();
        }

        if (!_context.Wards.Any())
        {
            _context.Wards.AddRange(
                new Ward { Name = "Hải Châu I"  },
                new Ward { Name = "Hải Châu II" },
                new Ward { Name = "Thạch Thang" },
                new Ward { Name = "Nam Dương"   },
                new Ward { Name = "Phước Ninh"  }
            );
            await _context.SaveChangesAsync();
        }

        var wards = _context.Wards.ToList();

        if (!_context.Streets.Any())
        {
            var streetDefs = new[]
            {
                ("Trần Phú",           0), ("Bạch Đằng",         0), ("Lý Tự Trọng",      0),
                ("Phan Chu Trinh",     1), ("Nguyễn Chí Thanh",  1), ("Hoàng Diệu",       1),
                ("Hùng Vương",         2), ("Lê Duẩn",           2), ("Điện Biên Phủ",    2),
                ("Nguyễn Văn Linh",    3), ("Trưng Nữ Vương",    3), ("Ông Ích Khiêm",    3),
                ("Phan Đình Phùng",    4), ("Lê Lợi",            4), ("Nguyễn Tất Thành", 4),
            };
            foreach (var (name, wardIdx) in streetDefs)
                _context.Streets.Add(new Street { Name = name, WardId = wards[wardIdx].Id });
            await _context.SaveChangesAsync();
        }

        // ── 2. Locations (100) ─────────────────────────────────────────
        if (!_context.Locations.Any())
        {
            var streets = _context.Streets.ToList();
            for (int i = 0; i < 100; i++)
            {
                var street = streets[i % streets.Count];
                _context.Locations.Add(new Location
                {
                    StreetId    = street.Id,
                    HouseNumber = rand.Next(1, 400),
                    Latitude    = (decimal)Math.Round(16.0500 + rand.NextDouble() * 0.0400, 6),
                    Longitude   = (decimal)Math.Round(108.2100 + rand.NextDouble() * 0.0400, 6),
                    Description = $"Vị trí {i + 1} - {street.Name}"
                });
            }
            await _context.SaveChangesAsync();
        }

        // ── 3. Trees (100) ────────────────────────────────────────────
        if (!_context.Trees.Any())
        {
            var treeTypes  = _context.TreeTypes.ToList();
            var locations  = _context.Locations.ToList();
            var conditions = new[] { "Bình thường", "Cần cắt tỉa", "Mới trồng", "Sâu bệnh", "Tốt" };

            for (int i = 0; i < 100; i++)
            {
                var tt  = treeTypes[i % treeTypes.Count];
                var loc = locations[i];
                var tree = new Tree
                {
                    TreeTypeId    = tt.Id,
                    Name          = $"{tt.Name} #{i + 1}",
                    Condition     = conditions[i % conditions.Length],
                    Height        = Math.Round(3m + (decimal)(rand.NextDouble() * 15), 1),
                    TrunkDiameter = Math.Round(10m + (decimal)(rand.NextDouble() * 50), 1),
                    RecordedDate  = DateTime.UtcNow.AddMonths(-rand.Next(1, 48)),
                };
                tree.Relocate((double)loc.Latitude!.Value, (double)loc.Longitude!.Value);
                _context.Trees.Add(tree);
            }
            await _context.SaveChangesAsync();

            var savedTrees = _context.Trees.ToList();
            var savedLocs  = _context.Locations.ToList();
            for (int i = 0; i < savedTrees.Count; i++)
            {
                _context.TreeLocationHistories.Add(new TreeLocationHistory
                {
                    TreeId     = savedTrees[i].Id,
                    LocationId = savedLocs[i].Id,
                    FromDate   = savedTrees[i].RecordedDate ?? DateTime.UtcNow.AddYears(-1),
                    ToDate     = null
                });
            }
            await _context.SaveChangesAsync();
        }

        // ── 4. WorkTypes ───────────────────────────────────────────────
        if (!_context.WorkTypes.Any())
        {
            _context.WorkTypes.AddRange(
                new WorkType { Name = "Cắt tỉa cành"          },
                new WorkType { Name = "Tưới nước & bón phân"  },
                new WorkType { Name = "Xử lý sâu bệnh"        },
                new WorkType { Name = "Kiểm tra định kỳ"      },
                new WorkType { Name = "Trồng cây mới"         },
                new WorkType { Name = "Di dời cây"            },
                new WorkType { Name = "Phun thuốc phòng bệnh" }
            );
            await _context.SaveChangesAsync();
        }

        // ── 5. Plans (5) & Works (75) ─────────────────────────────────
        if (!_context.Plans.Any())
        {
            var workTypes = _context.WorkTypes.ToList();
            var trees     = _context.Trees.ToList();

            var planDefs = new[]
            {
                ("Kế hoạch mùa mưa 2024",      DateTime.UtcNow.AddMonths(-10), DateTime.UtcNow.AddMonths(-6)),
                ("Kế hoạch định kỳ Q4/2024",   DateTime.UtcNow.AddMonths(-6),  DateTime.UtcNow.AddMonths(-3)),
                ("Kế hoạch định kỳ Q1/2025",   DateTime.UtcNow.AddMonths(-3),  DateTime.UtcNow.AddMonths(0)),
                ("Kế hoạch bảo dưỡng hè 2025", DateTime.UtcNow.AddMonths(0),   DateTime.UtcNow.AddMonths(3)),
                ("Kế hoạch cuối năm 2025",     DateTime.UtcNow.AddMonths(3),   DateTime.UtcNow.AddMonths(6)),
            };

            foreach (var (planName, start, end) in planDefs)
            {
                var plan = Plan.Create(planName, manager.Id, start, end);
                plan.Approve(admin.Id);
                _context.Plans.Add(plan);
                await _context.SaveChangesAsync();

                for (int w = 0; w < 15; w++)
                {
                    var wt   = workTypes[rand.Next(workTypes.Count)];
                    var work = Work.Create(wt.Id, plan.Id, manager.Id,
                        start.AddDays(rand.Next(0, 20)),
                        end.AddDays(-rand.Next(0, 10)));

                    switch (w % 5)
                    {
                        case 1: work.SubmitForApproval(); break;
                        case 2: work.SubmitForApproval(); work.Reject("Cần bổ sung thêm thông tin"); break;
                        case 3: work.SubmitForApproval(); work.Complete(); break;
                    }

                    _context.Works.Add(work);
                    await _context.SaveChangesAsync();

                    _context.WorkUsers.Add(new WorkUser
                    {
                        WorkId = work.Id,
                        UserId = employees[rand.Next(employees.Length)],
                        Role   = "Người thực hiện",
                        Status = "Assigned"
                    });

                    var tree = trees[rand.Next(trees.Count)];
                    _context.WorkDetails.Add(new WorkDetail
                    {
                        WorkId  = work.Id,
                        TreeId  = tree.Id,
                        Content = $"{wt.Name} cho {tree.Name}",
                        Status  = (w % 5 == 3) ? "Completed" : "Pending"
                    });

                    if (w % 5 == 2 || w % 5 == 3)
                    {
                        _context.WorkProgresses.Add(new WorkProgress
                        {
                            WorkId      = work.Id,
                            UpdaterId   = employees[rand.Next(employees.Length)],
                            Percentage  = w % 5 == 3 ? 100 : rand.Next(20, 80),
                            Note        = w % 5 == 3 ? "Hoàn thành công việc" : "Đang thực hiện",
                            UpdatedDate = start.AddDays(rand.Next(1, 15))
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }
        }

        // ── 6. Incidents (30) ─────────────────────────────────────────
        if (!_context.TreeIncidents.Any())
        {
            var trees    = _context.Trees.ToList();
            var contents = new[]
            {
                "Gãy cành lớn, nguy cơ rơi xuống đường",
                "Sâu bệnh tấn công, lá vàng úa",
                "Rễ cây trồi lên mặt đường, gây nguy hiểm",
                "Cây nghiêng sau mưa bão",
                "Mối mọt đục thân cây",
                "Cành khô có nguy cơ gãy",
                "Cây bị va chạm phương tiện",
                "Nấm mốc xuất hiện ở gốc cây",
                "Cây thiếu nước, lá héo",
                "Vỏ cây bị bóc tách",
            };
            var statuses = new[] { "Pending", "InProgress", "Resolved", "Pending", "Resolved" };

            for (int i = 0; i < 30; i++)
            {
                var tree     = trees[rand.Next(trees.Count)];
                var incident = TreeIncident.Create(
                    tree.Id,
                    employees[i % employees.Length],
                    contents[i % contents.Length],
                    reporterName:  $"Người dân {i + 1}",
                    reporterPhone: $"09{rand.Next(10000000, 99999999)}"
                );
                var status = statuses[i % statuses.Length];
                incident.UpdateStatus(status);
                if (status != "Pending")
                    incident.Approve(manager.Id);
                _context.TreeIncidents.Add(incident);
            }
            await _context.SaveChangesAsync();
        }
    }

    private async Task<ApplicationUser> EnsureUser(string email, string password, string fullName, string role)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = email, Email = email, FullName = fullName };
            await _userManager.CreateAsync(user, password);
        }
        if (!await _userManager.IsInRoleAsync(user, role))
            await _userManager.AddToRoleAsync(user, role);
        return user;
    }
}
