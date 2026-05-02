using Microsoft.AspNetCore.Identity;
using backend.Domain.Entities;
using backend.Domain.Enums;

namespace backend.Infrastructure.Identity;


public class ApplicationUser : IdentityUser
{
    public int? WardId { get; set; }
    public string? FullName { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public UserStatus Status { get; set; }

    // Navigation properties
    public Ward? Ward { get; set; }
    public ICollection<TreeIncident> ReportedIncidents { get; set; } = new List<TreeIncident>();
    public ICollection<TreeIncident> ApprovedIncidents { get; set; } = new List<TreeIncident>();
    public ICollection<Plan> CreatedPlans { get; set; } = new List<Plan>();
    public ICollection<Plan> ApprovedPlans { get; set; } = new List<Plan>();
    public ICollection<Work> CreatedWorks { get; set; } = new List<Work>();
    public ICollection<WorkUser> WorkUsers { get; set; } = new List<WorkUser>();
    public ICollection<WorkProgress> WorkProgresses { get; set; } = new List<WorkProgress>();
}
