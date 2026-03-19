using backend.Domain.Entities;
using backend.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class WorkConfiguration : IEntityTypeConfiguration<Work>
{
    public void Configure(EntityTypeBuilder<Work> builder)
    {
        builder.HasOne(w => w.Creator)
            .WithMany(u => u.CreatedWorks)
            .HasForeignKey(w => w.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

