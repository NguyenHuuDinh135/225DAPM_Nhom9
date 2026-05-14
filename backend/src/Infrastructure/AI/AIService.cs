using System.Runtime.CompilerServices;
using System.Text.Json;
using backend.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Infrastructure.AI;

public class AIService : IAIService
{
    private readonly OllamaClient _ollama;
    private readonly OllamaOptions _options;
    private readonly ILogger<AIService> _logger;

    public AIService(OllamaClient ollama, IOptions<OllamaOptions> options, ILogger<AIService> logger)
    {
        _ollama = ollama;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> AnalyzeIncidentSeverityAsync(string description)
    {
        try
        {
            var prompt = $"""
                Bạn là hệ thống phân loại mức độ nghiêm trọng sự cố cây xanh đô thị.
                Phân loại mô tả sự cố sau vào MỘT trong ba mức: Khẩn cấp, Cao, Bình thường.

                Quy tắc:
                - Khẩn cấp: đe dọa tính mạng, cây đổ/ngã đè người/xe, chắn đường giao thông, gãy lớn rơi xuống
                - Cao: có nguy cơ đổ, nghiêng nặng, sâu bệnh lan rộng, gãy cành lớn
                - Bình thường: cần cắt tỉa, lá vàng, rễ nổi nhẹ, cần theo dõi

                Mô tả sự cố: {description}

                Chỉ trả lời đúng một từ: Khẩn cấp, Cao, hoặc Bình thường.
                """;

            var result = await _ollama.GenerateAsync(_options.FastModel, prompt, temperature: 0.1f, maxTokens: 10);

            if (result.Contains("Khẩn cấp", StringComparison.OrdinalIgnoreCase))
                return "Khẩn cấp";
            if (result.Contains("Cao", StringComparison.OrdinalIgnoreCase))
                return "Cao";

            return "Bình thường";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama severity analysis failed, using keyword fallback");
            return FallbackSeverity(description);
        }
    }

    public async Task<bool> VerifyWorkCompletionAsync(string workType, string imagePath)
    {
        try
        {
            var prompt = $"""
                Bạn là AI kiểm tra nghiệm thu công việc cây xanh đô thị.
                Loại công việc: {workType}
                Ảnh chụp hiện trường: {imagePath}

                Dựa trên loại công việc, hãy đánh giá khả năng công việc đã hoàn thành.
                Trả lời JSON với format: completed (true/false), confidence (0.0-1.0), reason (lý do ngắn gọn)
                """;

            var result = await _ollama.GenerateAsync(_options.DefaultModel, prompt, temperature: 0.3f, maxTokens: 100);

            if (TryParseVerification(result, out var completed))
                return completed;

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama work verification failed, defaulting to true");
            return true;
        }
    }

    public async Task<string> SuggestMaintenancePlanAsync(List<string> overdueTreeNames)
    {
        if (overdueTreeNames.Count == 0)
            return "Tất cả cây xanh đều đang trong tình trạng tốt. Không có cây nào quá hạn bảo trì.";

        try
        {
            var treeList = string.Join("\n", overdueTreeNames.Take(20).Select((name, i) => $"{i + 1}. {name}"));

            var prompt = $"""
                Bạn là chuyên gia quản lý cây xanh đô thị Đà Nẵng. Phân tích danh sách {overdueTreeNames.Count} cây quá hạn bảo trì và đề xuất kế hoạch.

                Danh sách cây cần bảo trì:
                {treeList}

                Hãy đề xuất ngắn gọn:
                1. Thứ tự ưu tiên xử lý
                2. Loại công việc cần thực hiện cho từng nhóm
                3. Lịch trình gợi ý (tuần này / tuần sau / tháng sau)

                Trả lời bằng tiếng Việt, chuyên nghiệp, dưới 300 từ.
                """;

            var result = await _ollama.GenerateAsync(_options.DefaultModel, prompt, temperature: 0.7f, maxTokens: 1024);
            return string.IsNullOrWhiteSpace(result)
                ? $"Đề xuất bảo trì cho {overdueTreeNames.Count} cây quá hạn: {string.Join(", ", overdueTreeNames.Take(5))}."
                : result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama maintenance suggestion failed, using fallback");
            return $"Đề xuất lập kế hoạch bảo trì cho {overdueTreeNames.Count} cây đã quá hạn, bao gồm: {string.Join(", ", overdueTreeNames.Take(3))}...";
        }
    }

    public async Task<string> ChatAsync(string userMessage, List<ChatMessage>? history = null)
    {
        try
        {
            var messages = new List<ChatMessage>
            {
                new("system", """
                    Bạn là trợ lý AI quản lý cây xanh đô thị Đà Nẵng. Bạn hỗ trợ:
                    - Quản lý và theo dõi sức khỏe cây xanh
                    - Lập kế hoạch bảo trì, cắt tỉa, phun thuốc
                    - Xử lý và báo cáo sự cố
                    - Phân tích dữ liệu và xu hướng
                    - Tư vấn về các loài cây phù hợp với khí hậu Đà Nẵng
                    Trả lời ngắn gọn, chuyên nghiệp, bằng tiếng Việt. Tối đa 200 từ.
                    """)
            };

            if (history != null)
                messages.AddRange(history);

            messages.Add(new("user", userMessage));

            var result = await _ollama.ChatAsync(_options.DefaultModel, messages, temperature: 0.7f, maxTokens: 512);
            return string.IsNullOrWhiteSpace(result) ? "Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại." : result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama chat failed");
            return "AI đang offline. Vui lòng kiểm tra kết nối Ollama và thử lại.";
        }
    }

    public async IAsyncEnumerable<string> ChatStreamAsync(
        string userMessage,
        List<ChatMessage>? history = null,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var messages = new List<ChatMessage>
        {
            new("system", """
                Bạn là trợ lý AI quản lý cây xanh đô thị Đà Nẵng. Bạn hỗ trợ:
                - Quản lý và theo dõi sức khỏe cây xanh
                - Lập kế hoạch bảo trì, cắt tỉa, phun thuốc
                - Xử lý và báo cáo sự cố
                - Phân tích dữ liệu và xu hướng
                - Tư vấn về các loài cây phù hợp với khí hậu Đà Nẵng
                Trả lời ngắn gọn, chuyên nghiệp, bằng tiếng Việt. Tối đa 200 từ.
                """)
        };

        if (history != null)
            messages.AddRange(history);

        messages.Add(new("user", userMessage));

        var hasYielded = false;
        await foreach (var chunk in _ollama.ChatStreamAsync(_options.DefaultModel, messages, temperature: 0.7f, maxTokens: 512, cancellationToken: cancellationToken))
        {
            hasYielded = true;
            yield return chunk;
        }

        if (!hasYielded)
        {
            yield return "Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại.";
        }
    }

    public async Task<string> GenerateReportAsync(string reportType, object data)
    {
        try
        {
            var dataJson = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });

            var prompt = $"""
                Bạn là chuyên gia phân tích dữ liệu cây xanh đô thị Đà Nẵng.
                Hãy tạo báo cáo tóm tắt loại "{reportType}" dựa trên dữ liệu sau:

                {dataJson}

                Yêu cầu:
                - Tóm tắt tình hình chung
                - Điểm nổi bật cần chú ý
                - Đề xuất hành động tiếp theo
                - Trả lời bằng tiếng Việt, chuyên nghiệp, dưới 500 từ
                """;

            var result = await _ollama.GenerateAsync(_options.DefaultModel, prompt, temperature: 0.5f, maxTokens: 2048);
            return string.IsNullOrWhiteSpace(result) ? "Không thể tạo báo cáo. Vui lòng thử lại." : result;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama report generation failed");
            return "AI đang offline. Không thể tạo báo cáo.";
        }
    }

    public async Task<List<int>> DetectAnomaliesAsync(List<TreeHealthData> treeData)
    {
        if (treeData.Count == 0) return [];

        try
        {
            var summary = string.Join("\n", treeData.Take(50).Select(t =>
                $"ID:{t.TreeId} Tên:{t.Name ?? "N/A"} Tình trạng:{t.Condition ?? "N/A"} Loài:{t.TreeTypeName ?? "N/A"} Bảo trì cuối:{t.LastMaintenance?.ToString("dd/MM/yyyy") ?? "Chưa có"}"));

            var prompt = $"""
                Phân tích dữ liệu sức khỏe cây xanh sau và xác định những cây bất thường cần chú ý đặc biệt.
                Tiêu chí bất thường: tình trạng xấu, quá hạn bảo trì lâu, sâu bệnh.

                Dữ liệu:
                {summary}

                Trả lời danh sách ID cây bất thường, mỗi ID một dòng, chỉ số. Ví dụ:
                5
                12
                23
                """;

            var result = await _ollama.GenerateAsync(_options.DefaultModel, prompt, temperature: 0.3f, maxTokens: 200);

            var anomalyIds = result
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Trim())
                .Where(line => int.TryParse(line, out _))
                .Select(int.Parse)
                .Where(id => treeData.Any(t => t.TreeId == id))
                .ToList();

            return anomalyIds;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama anomaly detection failed");
            return [];
        }
    }

    public async Task<List<MaintenancePrediction>> PredictMaintenanceAsync(List<TreeHealthData> trees)
    {
        if (trees.Count == 0) return [];

        try
        {
            var summary = string.Join("\n", trees.Take(30).Select(t =>
            {
                var daysSince = t.LastMaintenance.HasValue ? (DateTime.UtcNow - t.LastMaintenance.Value).Days : -1;
                var overdue = t.MaintenanceIntervalDays.HasValue && daysSince > t.MaintenanceIntervalDays.Value;
                return $"ID:{t.TreeId} Tên:{t.Name ?? "N/A"} Loài:{t.TreeTypeName ?? "N/A"} Tình trạng:{t.Condition ?? "N/A"} Ngày từ bảo trì cuối:{daysSince} Quá hạn:{(overdue ? "Có" : "Không")}";
            }));

            var jsonExample = """[{"treeId": 5, "reason": "lý do ngắn", "urgency": 9, "action": "hành động đề xuất"}]""";
            var prompt = $"""
                Bạn là chuyên gia bảo trì cây xanh. Dự đoán cây nào cần bảo trì sớm nhất.
                Xếp hạng theo mức độ khẩn cấp (1-10, 10 là khẩn cấp nhất).

                Dữ liệu cây:
                {summary}

                Trả lời JSON array, tối đa 10 cây. Ví dụ format:
                {jsonExample}
                """;

            var result = await _ollama.GenerateAsync(_options.DefaultModel, prompt, temperature: 0.4f, maxTokens: 1024);

            var jsonStart = result.IndexOf('[');
            var jsonEnd = result.LastIndexOf(']');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var jsonStr = result[jsonStart..(jsonEnd + 1)];
                var predictions = JsonSerializer.Deserialize<List<PredictionDto>>(jsonStr, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (predictions != null)
                {
                    return predictions
                        .Where(p => trees.Any(t => t.TreeId == p.TreeId))
                        .Select(p => new MaintenancePrediction(
                            p.TreeId,
                            trees.FirstOrDefault(t => t.TreeId == p.TreeId)?.Name ?? "N/A",
                            p.Reason ?? "",
                            p.Urgency,
                            p.Action ?? ""))
                        .OrderByDescending(p => p.UrgencyScore)
                        .ToList();
                }
            }

            return [];
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama maintenance prediction failed");
            return [];
        }
    }

    public Task<bool> IsAvailableAsync() => _ollama.IsAvailableAsync();

    private static string FallbackSeverity(string description)
    {
        var lower = description.ToLower();
        if (lower.Contains("đè") || lower.Contains("ngã") || lower.Contains("ô tô") || lower.Contains("nguy hiểm"))
            return "Khẩn cấp";
        if (lower.Contains("gãy cành") || lower.Contains("sâu bệnh") || lower.Contains("nghiêng"))
            return "Cao";
        return "Bình thường";
    }

    private static bool TryParseVerification(string response, out bool completed)
    {
        completed = true;
        try
        {
            var jsonStart = response.IndexOf('{');
            var jsonEnd = response.LastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                var json = response[jsonStart..(jsonEnd + 1)];
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("completed", out var prop))
                {
                    completed = prop.GetBoolean();
                    return true;
                }
                if (doc.RootElement.TryGetProperty("confidence", out var conf))
                {
                    completed = conf.GetDouble() > 0.7;
                    return true;
                }
            }
        }
        catch { }
        return false;
    }
}

internal class PredictionDto
{
    public int TreeId { get; set; }
    public string? Reason { get; set; }
    public int Urgency { get; set; }
    public string? Action { get; set; }
}
