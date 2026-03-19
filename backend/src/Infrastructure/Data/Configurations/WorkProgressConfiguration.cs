using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class WorkProgressConfiguration : IEntityTypeConfiguration<WorkProgress>
{
    public void Configure(EntityTypeBuilder<WorkProgress> builder)
    {
        builder.HasOne(p => p.Updater)
            .WithMany(u => u.WorkProgresses)
            .HasForeignKey(p => p.UpdaterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

