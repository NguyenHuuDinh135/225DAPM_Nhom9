using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class TreeIncidentConfiguration : IEntityTypeConfiguration<TreeIncident>
{
    public void Configure(EntityTypeBuilder<TreeIncident> builder)
    {
        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.ReportedIncidents)
            .HasForeignKey(t => t.ReporterId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.ApprovedIncidents)
            .HasForeignKey(t => t.ApproverId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
