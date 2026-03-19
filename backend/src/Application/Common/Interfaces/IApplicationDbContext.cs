using backend.Domain.Entities;

namespace backend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Location> Locations { get; }

    DbSet<Plan> Plans { get; }

    DbSet<Street> Streets { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<TodoList> TodoLists { get; }

    DbSet<Tree> Trees { get; }

    DbSet<TreeIncident> TreeIncidents { get; }

    DbSet<TreeIncidentImage> TreeIncidentImages { get; }

    DbSet<TreeLocationHistory> TreeLocationHistories { get; }

    DbSet<TreeType> TreeTypes { get; }

    DbSet<Ward> Wards { get; }

    DbSet<Work> Works { get; }

    DbSet<WorkDetail> WorkDetails { get; }

    DbSet<WorkProgress> WorkProgresses { get; }

    DbSet<WorkType> WorkTypes { get; }

    DbSet<WorkUser> WorkUsers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
