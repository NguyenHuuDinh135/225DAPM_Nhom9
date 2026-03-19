using System.Reflection;
using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Location> Locations => Set<Location>();

    public DbSet<Plan> Plans => Set<Plan>();

    public DbSet<Street> Streets => Set<Street>();

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();

    public DbSet<TodoList> TodoLists => Set<TodoList>();

    public DbSet<Tree> Trees => Set<Tree>();

    public DbSet<TreeIncident> TreeIncidents => Set<TreeIncident>();

    public DbSet<TreeIncidentImage> TreeIncidentImages => Set<TreeIncidentImage>();

    public DbSet<TreeLocationHistory> TreeLocationHistories => Set<TreeLocationHistory>();

    public DbSet<TreeType> TreeTypes => Set<TreeType>();

    public DbSet<Ward> Wards => Set<Ward>();

    public DbSet<Work> Works => Set<Work>();

    public DbSet<WorkDetail> WorkDetails => Set<WorkDetail>();

    public DbSet<WorkProgress> WorkProgresses => Set<WorkProgress>();

    public DbSet<WorkType> WorkTypes => Set<WorkType>();

    public DbSet<WorkUser> WorkUsers => Set<WorkUser>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
