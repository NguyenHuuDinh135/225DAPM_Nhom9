using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class TreeConfiguration : IEntityTypeConfiguration<Tree>
{
    public void Configure(EntityTypeBuilder<Tree> builder)
    {
        builder.HasOne(t => t.TreeType)
            .WithMany(tt => tt.Trees)
            .HasForeignKey(t => t.TreeTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(t => t.TreeLocationHistories)
            .WithOne(h => h.Tree)
            .HasForeignKey(h => h.TreeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
