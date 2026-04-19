using System.Reflection;
using backend.Application.Common.Interfaces;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Shouldly;

namespace backend.Application.UnitTests.Infrastructure.Services;

public class MaintenanceJobServiceTests
{
    private Mock<IApplicationDbContext> _dbContextMock = null!;
    private Mock<ILogger<MaintenanceJobService>> _loggerMock = null!;
    private MaintenanceJobService _service = null!;

    [SetUp]
    public void Setup()
    {
        _dbContextMock = new Mock<IApplicationDbContext>();
        _loggerMock = new Mock<ILogger<MaintenanceJobService>>();
        _service = new MaintenanceJobService(_dbContextMock.Object, _loggerMock.Object);
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldCreateWorkForTreesDueForMaintenance()
    {
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: DateTime.UtcNow.AddDays(-35), relocationCount: 0, latitude: 10.0, longitude: 106.0);

        var workType = new WorkType { Id = 1, Name = "Bảo dưỡng định kỳ" };
        var plan = new Plan { Id = 1, Name = "Kế hoạch bảo dưỡng tự động", CreatorId = "system" };
        var works = new List<Work>();
        var workDetails = new List<WorkDetail>();

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.WorkTypes).Returns(CreateQueryableMockDbSet(new[] { workType }).Object);
        _dbContextMock.Setup(x => x.Plans).Returns(CreateQueryableMockDbSet(new[] { plan }).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(works).Object);
        _dbContextMock.Setup(x => x.WorkDetails).Returns(CreateListMockDbSet(workDetails).Object);
        _dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await _service.CheckAndGenerateMaintenanceWorkAsync();

        works.ShouldHaveSingleItem();
        workDetails.ShouldHaveSingleItem();

        var createdWork = works.Single();
        createdWork.WorkTypeId.ShouldBe(workType.Id);
        createdWork.PlanId.ShouldBe(plan.Id);
        createdWork.CreatorId.ShouldBe("system");
        createdWork.Status.ShouldBe(WorkStatus.New);
        createdWork.CreatedDate.ShouldNotBeNull();
        workDetails.Single().TreeId.ShouldBe(tree.Id);
        tree.LastMaintenanceDate.ShouldNotBeNull();
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldNotCreateWorkForTreesNotDueForMaintenance()
    {
        var expectedDate = DateTime.UtcNow.AddDays(-10);
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: expectedDate, relocationCount: 0, latitude: 10.0, longitude: 106.0);

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(new List<Work>()).Object);
        _dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0);

        await _service.CheckAndGenerateMaintenanceWorkAsync();

        tree.LastMaintenanceDate.ShouldBe(expectedDate);
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldThrowWhenMaintenanceMetadataIsMissing()
    {
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: DateTime.UtcNow.AddDays(-35), relocationCount: 0, latitude: 10.0, longitude: 106.0);

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.WorkTypes).Returns(CreateQueryableMockDbSet(Array.Empty<WorkType>()).Object);
        _dbContextMock.Setup(x => x.Plans).Returns(CreateQueryableMockDbSet(Array.Empty<Plan>()).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(new List<Work>()).Object);
        _dbContextMock.Setup(x => x.WorkDetails).Returns(CreateListMockDbSet(new List<WorkDetail>()).Object);

        await Should.ThrowAsync<InvalidOperationException>(() => _service.CheckAndGenerateMaintenanceWorkAsync());
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldNotCreateWorkForTreesAtRelocationLimit()
    {
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var lastMaintenanceDate = DateTime.UtcNow.AddDays(-35);
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: lastMaintenanceDate, relocationCount: 3, latitude: 10.0, longitude: 106.0);
        var works = new List<Work>();
        var workDetails = new List<WorkDetail>();

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.WorkTypes).Returns(CreateQueryableMockDbSet(new[] { new WorkType { Id = 1, Name = "Bảo dưỡng định kỳ" } }).Object);
        _dbContextMock.Setup(x => x.Plans).Returns(CreateQueryableMockDbSet(new[] { new Plan { Id = 1, Name = "Kế hoạch bảo dưỡng tự động", CreatorId = "system" } }).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(works).Object);
        _dbContextMock.Setup(x => x.WorkDetails).Returns(CreateListMockDbSet(workDetails).Object);
        _dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0);

        await _service.CheckAndGenerateMaintenanceWorkAsync();

        works.ShouldBeEmpty();
        workDetails.ShouldBeEmpty();
        tree.LastMaintenanceDate.ShouldBe(lastMaintenanceDate);
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldCreateWorkForTreesNeverMaintained()
    {
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: null, relocationCount: 0, latitude: 10.0, longitude: 106.0);

        var workType = new WorkType { Id = 1, Name = "Bảo dưỡng định kỳ" };
        var plan = new Plan { Id = 1, Name = "Kế hoạch bảo dưỡng tự động", CreatorId = "system" };

        var works = new List<Work>();
        var workDetails = new List<WorkDetail>();

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.WorkTypes).Returns(CreateQueryableMockDbSet(new[] { workType }).Object);
        _dbContextMock.Setup(x => x.Plans).Returns(CreateQueryableMockDbSet(new[] { plan }).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(works).Object);
        _dbContextMock.Setup(x => x.WorkDetails).Returns(CreateListMockDbSet(workDetails).Object);
        _dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);

        await _service.CheckAndGenerateMaintenanceWorkAsync();

        works.ShouldHaveSingleItem();
        tree.LastMaintenanceDate.ShouldNotBeNull();
    }

    [Test]
    public async Task CheckAndGenerateMaintenanceWorkAsync_ShouldBubbleDatabaseFailure()
    {
        var treeType = new TreeType { Id = 1, Name = "Cây xanh loại A", MaintenanceIntervalDays = 30 };
        var tree = CreateTree(id: 1, treeType: treeType, lastMaintenanceDate: DateTime.UtcNow.AddDays(-35), relocationCount: 0, latitude: 10.0, longitude: 106.0);

        _dbContextMock.Setup(x => x.Trees).Returns(CreateQueryableMockDbSet(new[] { tree }).Object);
        _dbContextMock.Setup(x => x.WorkTypes).Returns(CreateQueryableMockDbSet(new[] { new WorkType { Id = 1, Name = "Bảo dưỡng định kỳ" } }).Object);
        _dbContextMock.Setup(x => x.Plans).Returns(CreateQueryableMockDbSet(new[] { new Plan { Id = 1, Name = "Kế hoạch bảo dưỡng tự động", CreatorId = "system" } }).Object);
        _dbContextMock.Setup(x => x.Works).Returns(CreateListMockDbSet(new List<Work>()).Object);
        _dbContextMock.Setup(x => x.WorkDetails).Returns(CreateListMockDbSet(new List<WorkDetail>()).Object);
        _dbContextMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Database failed"));

        await Should.ThrowAsync<InvalidOperationException>(() => _service.CheckAndGenerateMaintenanceWorkAsync());
    }

    private static Mock<DbSet<T>> CreateQueryableMockDbSet<T>(IEnumerable<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mock = new Mock<DbSet<T>>();
        mock.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        return mock;
    }

    private static Mock<DbSet<T>> CreateListMockDbSet<T>(List<T> list) where T : class
    {
        var mock = new Mock<DbSet<T>>();
        mock.As<IQueryable<T>>().Setup(m => m.Provider).Returns(list.AsQueryable().Provider);
        mock.As<IQueryable<T>>().Setup(m => m.Expression).Returns(list.AsQueryable().Expression);
        mock.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(list.AsQueryable().ElementType);
        mock.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(list.AsQueryable().GetEnumerator());
        mock.Setup(d => d.Add(It.IsAny<T>())).Callback<T>(s => list.Add(s));
        return mock;
    }

    private static Tree CreateTree(
        int id,
        TreeType treeType,
        DateTime? lastMaintenanceDate,
        int relocationCount,
        double latitude = 0,
        double longitude = 0)
    {
        var tree = new Tree();
        SetProperty(tree, nameof(Tree.Id), id);
        SetProperty(tree, nameof(Tree.TreeTypeId), treeType.Id);
        SetProperty(tree, nameof(Tree.TreeType), treeType);
        SetProperty(tree, nameof(Tree.Name), "Test Tree");
        SetProperty(tree, nameof(Tree.LastMaintenanceDate), lastMaintenanceDate);
        SetProperty(tree, nameof(Tree.RelocationCount), relocationCount);
        SetProperty(tree, nameof(Tree.Latitude), latitude);
        SetProperty(tree, nameof(Tree.Longitude), longitude);
        return tree;
    }

    private static void SetProperty(object target, string propertyName, object? value)
    {
        var prop = target.GetType().GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
        prop.ShouldNotBeNull();
        prop.SetValue(target, value);
    }
}
