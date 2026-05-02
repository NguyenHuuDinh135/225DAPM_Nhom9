namespace backend.Application.Common.Interfaces;

public interface IAIService
{
    Task<string> AnalyzeIncidentSeverityAsync(string description);
    Task<bool> VerifyWorkCompletionAsync(string workType, string imagePath);
    Task<string> SuggestMaintenancePlanAsync(List<string> overdueTreeNames);
}
