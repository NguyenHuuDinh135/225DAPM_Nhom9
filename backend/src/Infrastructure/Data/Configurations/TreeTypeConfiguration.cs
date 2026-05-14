using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class TreeTypeConfiguration : IEntityTypeConfiguration<TreeType>
{
    public void Configure(EntityTypeBuilder<TreeType> builder)
    {
        builder.Property(tt => tt.Name)
            .HasMaxLength(200);

        builder.Property(tt => tt.Group)
            .HasMaxLength(100);
    }
}
