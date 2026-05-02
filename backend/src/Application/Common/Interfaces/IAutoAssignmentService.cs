using backend.Application.Common.Models;

namespace backend.Application.Common.Interfaces;

public interface IAutoAssignmentService
{
    Task<Result> AssignEmergencyWorkAsync(int workId, double? latitude, double? longitude, CancellationToken cancellationToken = default);
    Task<Result> AssignStandardWorksAsync(IEnumerable<int> workIds, string captainId, CancellationToken cancellationToken = default);
}
