using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WorkProgressConfiguration : IEntityTypeConfiguration<WorkProgress>
{
    public void Configure(EntityTypeBuilder<WorkProgress> builder)
    {
        builder.HasOne(wp => wp.Work)
            .WithMany(w => w.WorkProgresses)
            .HasForeignKey(wp => wp.WorkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.WorkProgresses)
            .HasForeignKey(wp => wp.UpdaterId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
