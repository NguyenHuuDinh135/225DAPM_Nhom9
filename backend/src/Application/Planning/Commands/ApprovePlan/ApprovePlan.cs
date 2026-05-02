using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.Planning.Commands.ApprovePlan;

public record ApprovePlanCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string ApproverId { get; init; } = string.Empty;
}

public class ApprovePlanCommandValidator : AbstractValidator<ApprovePlanCommand>
{
    public ApprovePlanCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ApproverId).NotEmpty();
    }
}

public class ApprovePlanCommandHandler : IRequestHandler<ApprovePlanCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public ApprovePlanCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Result> Handle(ApprovePlanCommand request, CancellationToken cancellationToken)
    {
        var plan = await _context.Plans.FindAsync([request.Id], cancellationToken);
        if (plan is null)
            return Result.Failure($"Plan {request.Id} not found.");

        try 
        {
            plan.Approve(request.ApproverId);
            await _context.SaveChangesAsync(cancellationToken);

            await _notificationService.SendNotificationAsync(
                "Kế hoạch đã duyệt",
                $"Kế hoạch '{plan.Name}' đã được Giám đốc phê duyệt.",
                "success"
            );

            return Result.Success();
        }
        catch (InvalidOperationException ex)
        {
            return Result.Failure(ex.Message);
        }
    }
}
