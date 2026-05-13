using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Events;
using NUnit.Framework;
using Shouldly;

namespace backend.Domain.UnitTests.Entities;

public class TreeIncidentTests
{
    [Test]
    public void Create_ShouldSetPendingStatus()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cây gãy cành");

        incident.Status.ShouldBe(IncidentStatus.Pending);
        incident.TreeId.ShouldBe(1);
        incident.ReporterId.ShouldBe("reporter-1");
        incident.Content.ShouldBe("Cây gãy cành");
        incident.Severity.ShouldBe("Bình thường");
        incident.ReportedDate.ShouldNotBeNull();
    }

    [Test]
    public void Create_ShouldRaiseIncidentCreatedEvent()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cây ngã đổ");

        incident.DomainEvents.ShouldContain(e => e is IncidentCreatedEvent);
        var evt = incident.DomainEvents.OfType<IncidentCreatedEvent>().Single();
        evt.Incident.ShouldBe(incident);
    }

    [Test]
    public void Create_WithCustomSeverity_ShouldSetSeverity()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cây ngã đổ", severity: "Khẩn cấp");

        incident.Severity.ShouldBe("Khẩn cấp");
    }

    [Test]
    public void Approve_ShouldSetApprovedStatus()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cành cây rơi");

        incident.Approve("approver-1", "team-1");

        incident.Status.ShouldBe(IncidentStatus.Approved);
        incident.ApproverId.ShouldBe("approver-1");
        incident.AssignedTeamId.ShouldBe("team-1");
    }

    [Test]
    public void UpdateStatus_ShouldChangeStatus()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cây bị sâu");

        incident.UpdateStatus(IncidentStatus.InProgress);

        incident.Status.ShouldBe(IncidentStatus.InProgress);
    }

    [Test]
    public void AddImage_ShouldAddToCollection()
    {
        var incident = TreeIncident.Create(1, "reporter-1", "Cành cây gãy");
        var image = new TreeIncidentImage { Path = "/uploads/img1.jpg", Description = "Ảnh sự cố" };

        incident.AddImage(image);

        incident.Images.Count.ShouldBe(1);
        incident.Images.First().Path.ShouldBe("/uploads/img1.jpg");
    }
}
