using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using backend.Domain.Entities;
using backend.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.WorkItems.Commands.AssignWork;

public record AssignWorkCommand : IRequest<Result>
{
    public int WorkTypeId { get; init; }
    public int PlanId { get; init; }
    public string CreatorId { get; init; } = string.Empty;
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public List<int> TreeIds { get; init; } = new();
    public List<string> UserIds { get; init; } = new();
}

public class AssignWorkCommandValidator : AbstractValidator<AssignWorkCommand>
{
    public AssignWorkCommandValidator()
    {
        RuleFor(x => x.WorkTypeId).GreaterThan(0);
        RuleFor(x => x.PlanId).GreaterThan(0);
        RuleFor(x => x.CreatorId).NotEmpty();
    }
}

public class AssignWorkCommandHandler : IRequestHandler<AssignWorkCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public AssignWorkCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(AssignWorkCommand request, CancellationToken cancellationToken)
    {
        Console.WriteLine($"[AssignWork] Handling command: WorkType={request.WorkTypeId}, Plan={request.PlanId}, Creator={request.CreatorId}");
        Console.WriteLine($"[AssignWork] Trees: {string.Join(",", request.TreeIds)}");
        Console.WriteLine($"[AssignWork] Users: {string.Join(",", request.UserIds)}");

        try
        {
            var work = Work.Create(
                request.WorkTypeId,
                request.PlanId,
                request.CreatorId,
                request.StartDate,
                request.EndDate);

            // Add WorkDetails for each tree
            if (request.TreeIds != null && request.TreeIds.Any())
            {
                foreach (var treeId in request.TreeIds)
                {
                    work.WorkDetails.Add(new WorkDetail
                    {
                        TreeId = treeId,
                        Status = "New"
                    });
                }
            }

            // Add WorkUsers for each user assigned
            if (request.UserIds != null && request.UserIds.Any())
            {
                foreach (var userId in request.UserIds)
                {
                    work.WorkUsers.Add(new WorkUser
                    {
                        UserId = userId,
                        Role = "NhanVien",
                        Status = "Assigned"
                    });
                }
            }

            _context.Works.Add(work);
            await _context.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (DbUpdateException dbEx)
        {
            var message = dbEx.InnerException?.Message ?? dbEx.Message;
            Console.WriteLine($"[AssignWork] DATABASE ERROR: {message}");
            return Result.Failure(new[] { $"Lỗi cơ sở dữ liệu: {message}" });
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            Console.WriteLine($"[AssignWork] ERROR: {message}");
            return Result.Failure(new[] { $"Lỗi hệ thống: {message}" });
        }
    }
}
