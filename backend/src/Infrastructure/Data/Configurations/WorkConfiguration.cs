using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WorkConfiguration : IEntityTypeConfiguration<Work>
{
    public void Configure(EntityTypeBuilder<Work> builder)
    {
        // Creator
        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.CreatedWorks)
            .HasForeignKey(w => w.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // WorkType
        builder.HasOne(w => w.WorkType)
            .WithMany(wt => wt.Works)
            .HasForeignKey(w => w.WorkTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // 🔥 Plan (QUAN TRỌNG)
        builder.HasOne(w => w.Plan)
            .WithMany(p => p.Works)
            .HasForeignKey(w => w.PlanId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
