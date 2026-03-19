using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class WorkUserConfiguration : IEntityTypeConfiguration<WorkUser>
{
    public void Configure(EntityTypeBuilder<WorkUser> builder)
    {
        builder.HasOne(wu => wu.User)
            .WithMany(u => u.WorkUsers)
            .HasForeignKey(wu => wu.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

