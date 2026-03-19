using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class TreeLocationHistoryConfiguration : IEntityTypeConfiguration<TreeLocationHistory>
{
    public void Configure(EntityTypeBuilder<TreeLocationHistory> builder)
    {
        builder.HasOne(h => h.Tree)
            .WithMany(t => t.TreeLocationHistories)
            .HasForeignKey(h => h.TreeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(h => h.Location)
            .WithMany(l => l.TreeLocationHistories)
            .HasForeignKey(h => h.LocationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

