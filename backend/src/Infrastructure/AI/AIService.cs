using backend.Application.Common.Interfaces;

namespace backend.Infrastructure.AI;

public class AIService : IAIService
{
    public Task<string> AnalyzeIncidentSeverityAsync(string description)
    {
        var lower = description.ToLower();
        if (lower.Contains("đè") || lower.Contains("ngã") || lower.Contains("ô tô") || lower.Contains("nguy hiểm"))
            return Task.FromResult("Khẩn cấp");
        
        if (lower.Contains("gãy cành") || lower.Contains("sâu bệnh") || lower.Contains("nghiêng"))
            return Task.FromResult("Cao");

        return Task.FromResult("Bình thường");
    }

    public Task<string> SuggestMaintenancePlanAsync(List<string> overdueTreeNames)
    {
        if (overdueTreeNames.Count == 0) return Task.FromResult("Tất cả cây xanh đều đang trong tình trạng tốt.");
        
        return Task.FromResult($"Đề xuất lập kế hoạch bảo trì cho {overdueTreeNames.Count} cây đã quá hạn, bao gồm: {string.Join(", ", overdueTreeNames.Take(3))}...");
    }

    public Task<bool> VerifyWorkCompletionAsync(string workType, string imagePath)
    {
        // Giả lập AI quét ảnh. Trong thực tế sẽ gọi Azure Vision hoặc OpenAI GPT-4o
        // Ở đây ta trả về true để demo luồng
        return Task.FromResult(true);
    }
}
