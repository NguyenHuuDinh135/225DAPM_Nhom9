using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Events;
using NUnit.Framework;
using Shouldly;

namespace backend.Domain.UnitTests.Entities;

public class PlanTests
{
    [Test]
    public void Create_ShouldSetDraftStatus()
    {
        var plan = Plan.Create("Kế hoạch A", "creator-1", DateTime.UtcNow, DateTime.UtcNow.AddDays(30));

        plan.Status.ShouldBe(PlanStatus.Draft);
        plan.Name.ShouldBe("Kế hoạch A");
        plan.CreatorId.ShouldBe("creator-1");
    }

    [Test]
    public void SubmitForApproval_FromDraft_ShouldSetPendingApproval()
    {
        var plan = Plan.Create("Plan B", "creator-1", null, null);

        plan.SubmitForApproval();

        plan.Status.ShouldBe(PlanStatus.PendingApproval);
    }

    [Test]
    public void SubmitForApproval_FromNeedsRevision_ShouldSucceed()
    {
        var plan = Plan.Create("Plan C", "creator-1", null, null);
        plan.SubmitForApproval();
        plan.RequestRevision("Cần sửa lại");

        plan.SubmitForApproval();

        plan.Status.ShouldBe(PlanStatus.PendingApproval);
    }

    [Test]
    public void SubmitForApproval_FromApproved_ShouldThrow()
    {
        var plan = Plan.Create("Plan D", "creator-1", null, null);
        plan.SubmitForApproval();
        plan.Approve("approver-1");

        Should.Throw<InvalidOperationException>(() => plan.SubmitForApproval());
    }

    [Test]
    public void Approve_FromPendingApproval_ShouldSetApproved()
    {
        var plan = Plan.Create("Plan E", "creator-1", null, null);
        plan.SubmitForApproval();

        plan.Approve("approver-1");

        plan.Status.ShouldBe(PlanStatus.Approved);
        plan.ApproverId.ShouldBe("approver-1");
        plan.ApprovedDate.ShouldNotBeNull();
        plan.RejectionReason.ShouldBeNull();
    }

    [Test]
    public void Approve_FromDraft_ShouldThrow()
    {
        var plan = Plan.Create("Plan F", "creator-1", null, null);

        Should.Throw<InvalidOperationException>(() => plan.Approve("approver-1"));
    }

    [Test]
    public void Reject_FromPendingApproval_ShouldSetRejected()
    {
        var plan = Plan.Create("Plan G", "creator-1", null, null);
        plan.SubmitForApproval();

        plan.Reject("Không đạt yêu cầu");

        plan.Status.ShouldBe(PlanStatus.Rejected);
        plan.RejectionReason.ShouldBe("Không đạt yêu cầu");
    }

    [Test]
    public void RequestRevision_ShouldSetNeedsRevision()
    {
        var plan = Plan.Create("Plan H", "creator-1", null, null);
        plan.SubmitForApproval();

        plan.RequestRevision("Cần bổ sung thêm thông tin");

        plan.Status.ShouldBe(PlanStatus.NeedsRevision);
        plan.RejectionReason.ShouldBe("Cần bổ sung thêm thông tin");
    }

    [Test]
    public void RequestRevision_FromDraft_ShouldThrow()
    {
        var plan = Plan.Create("Plan I", "creator-1", null, null);

        Should.Throw<InvalidOperationException>(() => plan.RequestRevision("reason"));
    }

    [Test]
    public void Complete_FromApproved_ShouldSucceed()
    {
        var plan = Plan.Create("Plan J", "creator-1", null, null);
        plan.SubmitForApproval();
        plan.Approve("approver-1");

        plan.Complete();

        plan.Status.ShouldBe(PlanStatus.Completed);
    }

    [Test]
    public void Complete_FromDraft_ShouldThrow()
    {
        var plan = Plan.Create("Plan K", "creator-1", null, null);

        Should.Throw<InvalidOperationException>(() => plan.Complete());
    }

    [Test]
    public void Cancel_ShouldSetCancelled()
    {
        var plan = Plan.Create("Plan L", "creator-1", null, null);

        plan.Cancel();

        plan.Status.ShouldBe(PlanStatus.Cancelled);
    }

    [Test]
    public void Approve_ShouldRaisePlanApprovedEvent()
    {
        var plan = Plan.Create("Plan M", "creator-1", null, null);
        plan.SubmitForApproval();

        plan.Approve("approver-1");

        plan.DomainEvents.ShouldContain(e => e is PlanApprovedEvent);
        var evt = plan.DomainEvents.OfType<PlanApprovedEvent>().Single();
        evt.Plan.ShouldBe(plan);
    }
}
