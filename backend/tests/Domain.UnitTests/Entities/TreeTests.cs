using System.Reflection;
using backend.Domain.Entities;
using NUnit.Framework;
using Shouldly;

namespace backend.Domain.UnitTests.Entities;

public class TreeTests
{
    [Test]
    public void Relocate_ShouldUpdateCoordinatesAndIncrementRelocationCount()
    {
        var tree = CreateTree(id: 1, latitude: 10.0, longitude: 106.0, relocationCount: 0);

        tree.Relocate(10.5, 106.5);

        tree.Latitude.ShouldBe(10.5);
        tree.Longitude.ShouldBe(106.5);
        tree.RelocationCount.ShouldBe(1);
    }

    [Test]
    public void Relocate_ShouldThrowWhenMaximumRelocationsReached()
    {
        var tree = CreateTree(id: 1, latitude: 10.0, longitude: 106.0, relocationCount: 3);

        var exception = Should.Throw<InvalidOperationException>(() => tree.Relocate(10.5, 106.5));

        exception.Message.ShouldBe("Quá giới hạn di dời.");
        tree.Latitude.ShouldBe(10.0);
        tree.Longitude.ShouldBe(106.0);
        tree.RelocationCount.ShouldBe(3);
    }

    [Test]
    public void UpdateLastMaintenanceDate_ShouldSetMaintenanceDate()
    {
        var tree = CreateTree(id: 1, latitude: 10.0, longitude: 106.0, relocationCount: 0);
        var maintenanceDate = new DateTime(2026, 4, 19, 0, 0, 0, DateTimeKind.Utc);

        tree.UpdateLastMaintenanceDate(maintenanceDate);

        tree.LastMaintenanceDate.ShouldBe(maintenanceDate);
    }

    private static Tree CreateTree(
        int id,
        double latitude,
        double longitude,
        int relocationCount,
        TreeType? treeType = null,
        DateTime? lastMaintenanceDate = null)
    {
        treeType ??= new TreeType { Id = 1, Name = "Cây thử" };
        var tree = new Tree();

        SetProperty(tree, nameof(Tree.Id), id);
        SetProperty(tree, nameof(Tree.TreeTypeId), treeType.Id);
        SetProperty(tree, nameof(Tree.TreeType), treeType);
        SetProperty(tree, nameof(Tree.Name), "Test Tree");
        SetProperty(tree, nameof(Tree.Latitude), latitude);
        SetProperty(tree, nameof(Tree.Longitude), longitude);
        SetProperty(tree, nameof(Tree.RelocationCount), relocationCount);
        SetProperty(tree, nameof(Tree.LastMaintenanceDate), lastMaintenanceDate);

        return tree;
    }

    private static void SetProperty(object target, string propertyName, object? value)
    {
        var prop = target.GetType().GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
        prop.ShouldNotBeNull();
        prop.SetValue(target, value);
    }
}
