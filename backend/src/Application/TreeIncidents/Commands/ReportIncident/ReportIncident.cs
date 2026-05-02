using backend.Application.Common.Interfaces;
using backend.Application.Common.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Application.TreeIncidents.Commands.ReportIncident;

public record ReportIncidentCommand : IRequest<Result<int>>
{
    public int TreeId { get; init; }
    public string? Content { get; init; }
    public string? ReporterName { get; init; }
    public string? ReporterPhone { get; init; }
    public List<IFormFile>? Images { get; init; }
}

public class ReportIncidentCommandValidator : AbstractValidator<ReportIncidentCommand>
{
    public ReportIncidentCommandValidator()
    {
        RuleFor(x => x.TreeId).GreaterThan(0);
        RuleForEach(x => x.Images).NotNull();
    }
}

public class ReportIncidentCommandHandler(IIncidentCreationService incidentCreationService)
    : IRequestHandler<ReportIncidentCommand, Result<int>>
{
    public async Task<Result<int>> Handle(ReportIncidentCommand request, CancellationToken cancellationToken)
    {
        return await incidentCreationService.CreateAsync(
            treeId: request.TreeId,
            reporterId: null, // Báo cáo ẩn danh từ dân
            content: request.Content,
            reporterName: request.ReporterName,
            reporterPhone: request.ReporterPhone,
            images: request.Images,
            cancellationToken: cancellationToken);
    }
}
