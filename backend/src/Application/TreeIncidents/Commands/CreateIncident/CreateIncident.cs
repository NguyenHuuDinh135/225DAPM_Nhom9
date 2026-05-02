using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;

namespace backend.Application.TreeIncidents.Commands.CreateIncident;

public record CreateIncidentCommand : IRequest<Result<int>>
{
    public int TreeId { get; init; }
    public string ReporterId { get; init; } = "anonymous";
    public string? Content { get; init; }
    public string? ReporterName { get; init; }
    public string? ReporterPhone { get; init; }
}

public class CreateIncidentCommandValidator : AbstractValidator<CreateIncidentCommand>
{
    public CreateIncidentCommandValidator()
    {
        RuleFor(x => x.TreeId).GreaterThan(0);
        RuleFor(x => x.ReporterId).NotEmpty();
    }
}

public class CreateIncidentCommandHandler(IIncidentCreationService incidentCreationService)
    : IRequestHandler<CreateIncidentCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateIncidentCommand request, CancellationToken cancellationToken)
    {
        return await incidentCreationService.CreateAsync(
            treeId: request.TreeId,
            reporterId: request.ReporterId,
            content: request.Content,
            reporterName: request.ReporterName,
            reporterPhone: request.ReporterPhone,
            images: null,
            cancellationToken: cancellationToken);
    }
}
