using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class StreetConfiguration : IEntityTypeConfiguration<Street>
{
    public void Configure(EntityTypeBuilder<Street> builder)
    {
        builder.HasOne(s => s.Ward)
            .WithMany(w => w.Streets)
            .HasForeignKey(s => s.WardId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

