using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WardConfiguration : IEntityTypeConfiguration<Ward>
{
    public void Configure(EntityTypeBuilder<Ward> builder)
    {
        builder.Property(w => w.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasMany<ApplicationUser>()
            .WithOne(u => u.Ward)
            .HasForeignKey(u => u.WardId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
