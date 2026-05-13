using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class TreeIncidentImageConfiguration : IEntityTypeConfiguration<TreeIncidentImage>
{
    public void Configure(EntityTypeBuilder<TreeIncidentImage> builder)
    {
        builder.HasOne(img => img.TreeIncident)
            .WithMany(i => i.Images)
            .HasForeignKey(img => img.TreeIncidentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
