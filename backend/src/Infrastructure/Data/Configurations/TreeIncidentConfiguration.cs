using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class TreeIncidentConfiguration : IEntityTypeConfiguration<TreeIncident>
{
    public void Configure(EntityTypeBuilder<TreeIncident> builder)
    {
        builder.HasOne(i => i.Reporter)
            .WithMany(u => u.ReportedIncidents)
            .HasForeignKey(i => i.ReporterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Approver)
            .WithMany(u => u.ApprovedIncidents)
            .HasForeignKey(i => i.ApproverId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

