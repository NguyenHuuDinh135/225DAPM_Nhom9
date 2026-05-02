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
            // Use MigrateAsync for persistence. 
            // Only use EnsureDeleted if you want a complete reset on EVERY restart.
            // await _context.Database.EnsureDeletedAsync(); 
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
        foreach (var role in new[] { Roles.GiamDoc, Roles.DoiTruong, Roles.NhanVien })
            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

        var giamDoc   = await EnsureUser("giamdoc@localhost",   "GiamDoc1!",   "Nguyễn Văn Giám Đốc",       Roles.GiamDoc,   "https://api.dicebear.com/7.x/avataaars/svg?seed=GiamDoc");
        var doiTruong = await EnsureUser("doitruong@localhost", "DoiTruong1!", "Trần Thị Đội Trưởng",        Roles.DoiTruong,  "https://api.dicebear.com/7.x/avataaars/svg?seed=DoiTruong");
        var emp1      = await EnsureUser("emp1@localhost",      "NhanVien1!", "Lê Văn Nhân Viên",            Roles.NhanVien,   "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix");
        var emp2      = await EnsureUser("emp2@localhost",      "NhanVien1!", "Phạm Thị Công Nhân",          Roles.NhanVien,   "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka");
        var emp3      = await EnsureUser("emp3@localhost",      "NhanVien1!", "Nguyễn Thị Hoa",              Roles.NhanVien,   "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo");
        var emp4      = await EnsureUser("emp4@localhost",      "NhanVien1!", "Trần Văn Bình",               Roles.NhanVien,   "https://api.dicebear.com/7.x/avataaars/svg?seed=Kiki");
        var emp5      = await EnsureUser("emp5@localhost",      "NhanVien1!", "Võ Thị Lan",                  Roles.NhanVien,   "https://api.dicebear.com/7.x/avataaars/svg?seed=Tigger");

        var employees = new[] { emp1.Id, emp2.Id, emp3.Id, emp4.Id, emp5.Id };

        // ── 1. Master Data ─────────────────────────────────────────────
        var treeTypeImages = new Dictionary<string, string>
        {
            { "Phượng vĩ",       "https://images.unsplash.com/photo-1596720426673-e483d47a8a1b?auto=format&fit=crop&q=80&w=800" },
            { "Bàng đài loan",   "https://images.unsplash.com/photo-1544139150-4729feee40f4?auto=format&fit=crop&q=80&w=800" },
            { "Muồng hoàng yến", "https://images.unsplash.com/photo-1621274790572-7c32596bc67f?auto=format&fit=crop&q=80&w=800" },
            { "Xà cừ",           "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&q=80&w=800" },
            { "Lim sẹt",         "https://images.unsplash.com/photo-1464391618274-9ca34f93680e?auto=format&fit=crop&q=80&w=800" },
            { "Sao đen",         "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?auto=format&fit=crop&q=80&w=800" },
            { "Dầu rái",         "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800" }
        };

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
            if (!treeTypes.Any()) return; 

            var locations  = _context.Locations.ToList();
            if (!locations.Any()) return;

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
                    MainImageUrl  = treeTypeImages.GetValueOrDefault(tt.Name),
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

        // ── 5. Plans (15) & Works (300) ────────────────────────────────
        if (_context.Plans.Count() < 5)
        {
            var workTypes = _context.WorkTypes.ToList();
            var trees     = _context.Trees.ToList();

            for (int p = 0; p < 15; p++)
            {
                var start = DateTime.UtcNow.AddMonths(-p + 2).AddDays(rand.Next(1, 10));
                var end   = start.AddMonths(1).AddDays(rand.Next(1, 10));
                var planName = $"Kế hoạch bảo trì tháng {(DateTime.UtcNow.AddMonths(-p + 2)).Month}/{start.Year}";

                var plan = Plan.Create(planName, doiTruong.Id, start, end);
                
                if (p < 5)
                {
                    plan.SubmitForApproval();
                    plan.Approve(giamDoc.Id);
                    plan.Complete();
                }
                else if (p < 8)
                {
                    plan.SubmitForApproval();
                    plan.Approve(giamDoc.Id);
                }
                else if (p == 8)
                {
                    plan.SubmitForApproval();
                }
                else if (p == 9)
                {
                    plan.SubmitForApproval();
                    plan.RequestRevision("Kinh phí dự kiến quá cao, cần tối ưu lại số lượng nhân công.");
                }

                _context.Plans.Add(plan);
                await _context.SaveChangesAsync();

                for (int w = 0; w < 10; w++)
                {
                    var wt   = workTypes[rand.Next(workTypes.Count)];
                    var workStart = start.AddDays(rand.Next(0, 20));
                    var workEnd   = workStart.AddDays(rand.Next(1, 7));
                    
                    var work = Work.Create(wt.Id, plan.Id, doiTruong.Id, workStart, workEnd);

                    if (plan.Status == PlanStatus.Completed)
                    {
                        work.SubmitForApproval();
                        work.Complete();
                    }
                    else if (plan.Status == PlanStatus.Approved && w < 5)
                    {
                        work.SubmitForApproval();
                        work.Complete();
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
                        Status  = (work.Status == WorkStatus.Completed) ? "Completed" : "Pending"
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        // ── 6. Incidents (150) ────────────────────────────────────────
        if (_context.TreeIncidents.Count() < 50)
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
            var incidentImages = new[]
            {
                "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&q=80&w=800",
                "https://images.unsplash.com/photo-1621944190310-e3cca1564bd7?auto=format&fit=crop&q=80&w=800"
            };
            var statuses = new[] { "Pending", "InProgress", "Resolved" };

            for (int i = 0; i < 150; i++)
            {
                var tree     = trees[rand.Next(trees.Count)];
                var incident = TreeIncident.Create(
                    tree.Id,
                    employees[i % employees.Length],
                    contents[rand.Next(contents.Length)],
                    reporterName:  $"Người dân {i + 1}",
                    reporterPhone: $"09{rand.Next(10000000, 99999999)}"
                );

                if (i % 3 == 0)
                {
                    incident.AddImage(new TreeIncidentImage { Path = incidentImages[rand.Next(incidentImages.Length)], Description = "Ảnh hiện trường" });
                }
                
                var reportedDate = DateTime.UtcNow.AddDays(-rand.Next(0, 180));
                var prop = typeof(TreeIncident).GetProperty("ReportedDate");
                prop?.SetValue(incident, reportedDate);

                var status = statuses[rand.Next(statuses.Length)];
                incident.UpdateStatus(status);
                if (status != "Pending")
                    incident.Approve(doiTruong.Id);
                    
                _context.TreeIncidents.Add(incident);
            }
            await _context.SaveChangesAsync();
        }
    }

    private async Task<ApplicationUser> EnsureUser(string email, string password, string fullName, string role, string? avatarUrl = null)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser { UserName = email, Email = email, FullName = fullName, Status = UserStatus.Active, AvatarUrl = avatarUrl };
            await _userManager.CreateAsync(user, password);
        }
        else
        {
            user.AvatarUrl = avatarUrl;
            user.FullName = fullName;
            await _userManager.UpdateAsync(user);

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            await _userManager.ResetPasswordAsync(user, token, password);
        }

        if (!await _userManager.IsInRoleAsync(user, role))
            await _userManager.AddToRoleAsync(user, role);

        return user;
    }
}
