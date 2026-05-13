using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WorkProgressImageConfiguration : IEntityTypeConfiguration<WorkProgressImage>
{
    public void Configure(EntityTypeBuilder<WorkProgressImage> builder)
    {
        builder.HasOne(img => img.WorkProgress)
            .WithMany(p => p.Images)
            .HasForeignKey(img => img.WorkProgressId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
