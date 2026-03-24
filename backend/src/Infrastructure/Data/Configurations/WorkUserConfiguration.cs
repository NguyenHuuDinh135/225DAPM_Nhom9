using backend.Domain.Entities;
using backend.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WorkUserConfiguration : IEntityTypeConfiguration<WorkUser>
{
    public void Configure(EntityTypeBuilder<WorkUser> builder)
    {
        builder.HasOne(wu => wu.Work)
            .WithMany(w => w.WorkUsers)
            .HasForeignKey(wu => wu.WorkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<ApplicationUser>()
            .WithMany(u => u.WorkUsers)
            .HasForeignKey(wu => wu.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
