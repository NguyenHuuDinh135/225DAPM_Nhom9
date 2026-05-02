using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.TreeIncidents.Commands.ApproveIncident;

public record ApproveIncidentCommand : IRequest<Result>
{
    public int Id { get; init; }
    public string ApproverId { get; init; } = string.Empty;
    public string? TeamId { get; init; }
}

public class ApproveIncidentCommandValidator : AbstractValidator<ApproveIncidentCommand>
{
    public ApproveIncidentCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ApproverId).NotEmpty();
    }
}

public class ApproveIncidentCommandHandler(IApplicationDbContext context, INotificationService notificationService)
    : IRequestHandler<ApproveIncidentCommand, Result>
{
    public async Task<Result> Handle(ApproveIncidentCommand request, CancellationToken cancellationToken)
    {
        var incident = await context.TreeIncidents
            .Include(i => i.Tree)
            .FirstOrDefaultAsync(i => i.Id == request.Id, cancellationToken);
            
        if (incident is null) return Result.Failure("Sự cố không tồn tại.");
        
        try 
        {
            incident.Approve(request.ApproverId, request.TeamId);
            await context.SaveChangesAsync(cancellationToken);

            await notificationService.SendNotificationAsync(
                "Sự cố đã được duyệt",
                $"Sự cố tại cây '{incident.Tree.Name}' đã được duyệt và điều phối.",
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
