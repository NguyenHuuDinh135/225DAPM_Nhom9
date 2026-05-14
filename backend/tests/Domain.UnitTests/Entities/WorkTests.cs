using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Domain.Events;
using NUnit.Framework;
using Shouldly;

namespace backend.Domain.UnitTests.Entities;

public class WorkTests
{
    [Test]
    public void Create_ShouldSetNewStatus()
    {
        var work = Work.Create(1, 1, "creator-1", DateTime.UtcNow, DateTime.UtcNow.AddDays(7));

        work.Status.ShouldBe(WorkStatus.New);
        work.WorkTypeId.ShouldBe(1);
        work.PlanId.ShouldBe(1);
        work.CreatorId.ShouldBe("creator-1");
    }

    [Test]
    public void Start_ShouldSetInProgress()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);

        work.Start();

        work.Status.ShouldBe(WorkStatus.InProgress);
    }

    [Test]
    public void SubmitForApproval_ShouldSetWaitingForApproval()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        work.Start();

        work.SubmitForApproval();

        work.Status.ShouldBe(WorkStatus.WaitingForApproval);
    }

    [Test]
    public void Complete_ShouldSetCompleted()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        work.Start();

        work.Complete();

        work.Status.ShouldBe(WorkStatus.Completed);
        work.RejectionFeedback.ShouldBeNull();
    }

    [Test]
    public void Complete_ShouldRaiseWorkCompletedEvent()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        work.Start();

        work.Complete();

        work.DomainEvents.ShouldContain(e => e is WorkCompletedEvent);
        var evt = work.DomainEvents.OfType<WorkCompletedEvent>().Single();
        evt.Work.ShouldBe(work);
    }

    [Test]
    public void Complete_ShouldClearRejectionFeedback()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        work.Start();
        work.SubmitForApproval();
        work.Reject("Feedback");
        work.RejectionFeedback.ShouldBe("Feedback");

        work.Complete();

        work.RejectionFeedback.ShouldBeNull();
    }

    [Test]
    public void Reject_ShouldSetInProgressAndStoreFeedback()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        work.Start();
        work.SubmitForApproval();

        work.Reject("Chưa đạt yêu cầu");

        work.Status.ShouldBe(WorkStatus.InProgress);
        work.RejectionFeedback.ShouldBe("Chưa đạt yêu cầu");
    }

    [Test]
    public void Update_ShouldChangeStartAndEndDate()
    {
        var work = Work.Create(1, 1, "creator-1", null, null);
        var newStart = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var newEnd = new DateTime(2026, 6, 30, 0, 0, 0, DateTimeKind.Utc);

        work.Update(newStart, newEnd);

        work.StartDate.ShouldBe(newStart);
        work.EndDate.ShouldBe(newEnd);
    }
}
