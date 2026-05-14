namespace backend.Application.Common.Interfaces;

public record ChatMessage(string Role, string Content);

public record TreeHealthData(int TreeId, string? Name, string? Condition, string? TreeTypeName, DateTime? LastMaintenance, int? MaintenanceIntervalDays);

public record MaintenancePrediction(int TreeId, string TreeName, string Reason, int UrgencyScore, string SuggestedAction);

public interface IAIService
{
    Task<string> AnalyzeIncidentSeverityAsync(string description);
    Task<bool> VerifyWorkCompletionAsync(string workType, string imagePath);
    Task<string> SuggestMaintenancePlanAsync(List<string> overdueTreeNames);
    Task<string> ChatAsync(string userMessage, List<ChatMessage>? history = null);
    IAsyncEnumerable<string> ChatStreamAsync(string userMessage, List<ChatMessage>? history = null, CancellationToken cancellationToken = default);
    Task<string> GenerateReportAsync(string reportType, object data);
    Task<List<int>> DetectAnomaliesAsync(List<TreeHealthData> treeData);
    Task<List<MaintenancePrediction>> PredictMaintenanceAsync(List<TreeHealthData> trees);
    Task<bool> IsAvailableAsync();
}
