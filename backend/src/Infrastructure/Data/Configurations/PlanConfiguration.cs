using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class PlanConfiguration : IEntityTypeConfiguration<Plan>
{
    public void Configure(EntityTypeBuilder<Plan> builder)
    {
        builder.HasOne(p => p.Creator)
            .WithMany(u => u.CreatedPlans)
            .HasForeignKey(p => p.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Approver)
            .WithMany(u => u.ApprovedPlans)
            .HasForeignKey(p => p.ApproverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

