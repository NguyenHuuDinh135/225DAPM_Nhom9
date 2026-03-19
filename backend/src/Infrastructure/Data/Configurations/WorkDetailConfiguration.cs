using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Infrastructure.Data.Configurations;

public sealed class WorkDetailConfiguration : IEntityTypeConfiguration<WorkDetail>
{
    public void Configure(EntityTypeBuilder<WorkDetail> builder)
    {
        builder.HasOne(wd => wd.Work)
            .WithMany(w => w.WorkDetails)
            .HasForeignKey(wd => wd.WorkId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(wd => wd.Tree)
            .WithMany(t => t.WorkDetails)
            .HasForeignKey(wd => wd.TreeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(wd => wd.NewLocation)
            .WithMany(l => l.WorkDetails)
            .HasForeignKey(wd => wd.NewLocationId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(wd => wd.ReplacementTree)
            .WithMany()
            .HasForeignKey(wd => wd.ReplacementTreeId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

