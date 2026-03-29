using backend.Domain.Entities;

namespace backend.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<TodoList> TodoLists { get; }

    DbSet<TodoItem> TodoItems { get; }

    DbSet<Work> Works { get; }

    DbSet<WorkType> WorkTypes { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
