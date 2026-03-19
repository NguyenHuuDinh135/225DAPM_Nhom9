using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class LocationConfiguration : IEntityTypeConfiguration<Location>
{
    public void Configure(EntityTypeBuilder<Location> builder)
    {
        builder.HasOne(l => l.Street)
            .WithMany(s => s.Locations)
            .HasForeignKey(l => l.StreetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

