using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public class WorkDetailConfiguration : IEntityTypeConfiguration<WorkDetail>
{
    public void Configure(EntityTypeBuilder<WorkDetail> builder)
    {
        // Tree chính
        builder.HasOne(wd => wd.Tree)
            .WithMany(t => t.WorkDetails)
            .HasForeignKey(wd => wd.TreeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Tree thay thế (tránh EF nhầm)
        builder.HasOne(wd => wd.ReplacementTree)
            .WithMany()
            .HasForeignKey(wd => wd.ReplacementTreeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Work
        builder.HasOne(wd => wd.Work)
            .WithMany(w => w.WorkDetails)
            .HasForeignKey(wd => wd.WorkId)
            .OnDelete(DeleteBehavior.Cascade);

        // 🔥 FIX THIẾU: Location
        builder.HasOne(wd => wd.NewLocation)
            .WithMany(l => l.WorkDetails)
            .HasForeignKey(wd => wd.NewLocationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
