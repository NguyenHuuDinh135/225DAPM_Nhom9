using backend.Domain.Entities;

namespace backend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }
    DbSet<TodoItem> TodoItems { get; }
    DbSet<Location> Locations { get; }
    DbSet<Tree> Trees { get; }
    DbSet<TreeIncident> TreeIncidents { get; }
    DbSet<Work> Works { get; }
    DbSet<WorkDetail> WorkDetails { get; }
    DbSet<WorkProgress> WorkProgresses { get; }
    DbSet<WorkProgressImage> WorkProgressImages { get; }
    DbSet<WorkUser> WorkUsers { get; }
    DbSet<WorkType> WorkTypes { get; }
    DbSet<Plan> Plans { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
