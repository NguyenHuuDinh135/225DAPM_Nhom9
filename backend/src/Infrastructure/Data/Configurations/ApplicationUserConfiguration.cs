using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.HasOne(u => u.Ward)
            .WithMany(w => w.Users)
            .HasForeignKey(u => u.WardId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

