using backend.Domain.Entities;

namespace backend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<Location> Locations { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
