using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        // Creator
        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.CreatedPlans)
            .HasForeignKey(p => p.CreatorId)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);

        // Approver
        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.ApprovedPlans)
            .HasForeignKey(p => p.ApproverId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
