using backend.Application.Common.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Application.Common.Interfaces;

public interface IIncidentCreationService
{
    Task<Result<int>> CreateAsync(
        int treeId,
        string? reporterId,
        string? content,
        string? reporterName,
        string? reporterPhone,
        List<IFormFile>? images,
        CancellationToken cancellationToken);
}
