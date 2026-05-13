using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace backend.Infrastructure.AI;

public class OllamaClient
{
    private readonly HttpClient _httpClient;
    private readonly OllamaOptions _options;
    private readonly ILogger<OllamaClient> _logger;

    public OllamaClient(IOptions<OllamaOptions> options, ILogger<OllamaClient> logger)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = new HttpClient
        {
            BaseAddress = new Uri(_options.BaseUrl),
            Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds)
        };
    }

    public async Task<string> GenerateAsync(string model, string prompt, float temperature = 0.7f, int maxTokens = 0)
    {
        var numPredict = maxTokens > 0 ? maxTokens : _options.MaxTokens;

        var request = new
        {
            model,
            prompt,
            stream = false,
            options = new
            {
                temperature,
                num_predict = numPredict
            }
        };

        var response = await _httpClient.PostAsJsonAsync("/api/generate", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<OllamaGenerateResponse>();
        return result?.Response?.Trim() ?? string.Empty;
    }

    public async Task<string> ChatAsync(string model, List<ChatMessage> messages, float temperature = 0.7f, int maxTokens = 0)
    {
        var numPredict = maxTokens > 0 ? maxTokens : _options.MaxTokens;

        var ollamaMessages = messages.Select(m => new { role = m.Role, content = m.Content }).ToList();

        var request = new
        {
            model,
            messages = ollamaMessages,
            stream = false,
            options = new
            {
                temperature,
                num_predict = numPredict
            }
        };

        var response = await _httpClient.PostAsJsonAsync("/api/chat", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<OllamaChatResponse>();
        return result?.Message?.Content?.Trim() ?? string.Empty;
    }

    public async IAsyncEnumerable<string> GenerateStreamAsync(
        string model,
        string prompt,
        float temperature = 0.7f,
        int maxTokens = 0,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var numPredict = maxTokens > 0 ? maxTokens : _options.MaxTokens;

        var request = new
        {
            model,
            prompt,
            stream = true,
            options = new
            {
                temperature,
                num_predict = numPredict
            }
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/generate")
        {
            Content = JsonContent.Create(request)
        };

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line)) continue;

            var chunk = JsonSerializer.Deserialize<OllamaGenerateResponse>(line);
            if (!string.IsNullOrEmpty(chunk?.Response))
            {
                yield return chunk.Response;
            }
        }
    }

    public async IAsyncEnumerable<string> ChatStreamAsync(
        string model,
        List<ChatMessage> messages,
        float temperature = 0.7f,
        int maxTokens = 0,
        [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var numPredict = maxTokens > 0 ? maxTokens : _options.MaxTokens;

        var ollamaMessages = messages.Select(m => new { role = m.Role, content = m.Content }).ToList();

        var request = new
        {
            model,
            messages = ollamaMessages,
            stream = true,
            options = new
            {
                temperature,
                num_predict = numPredict
            }
        };

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/api/chat")
        {
            Content = JsonContent.Create(request)
        };

        using var response = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        while (!reader.EndOfStream)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var line = await reader.ReadLineAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(line)) continue;

            var chunk = JsonSerializer.Deserialize<OllamaChatResponse>(line);
            if (!string.IsNullOrEmpty(chunk?.Message?.Content))
            {
                yield return chunk.Message.Content;
            }
        }
    }

    public async Task<float[]> EmbedAsync(string text)
    {
        var request = new
        {
            model = _options.EmbeddingModel,
            prompt = text
        };

        var response = await _httpClient.PostAsJsonAsync("/api/embeddings", request);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<OllamaEmbeddingResponse>();
        return result?.Embedding ?? [];
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/tags");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ollama health check failed");
            return false;
        }
    }
}

internal class OllamaGenerateResponse
{
    [JsonPropertyName("response")]
    public string? Response { get; set; }
}

internal class OllamaChatResponse
{
    [JsonPropertyName("message")]
    public OllamaChatMessage? Message { get; set; }
}

internal class OllamaChatMessage
{
    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

internal class OllamaEmbeddingResponse
{
    [JsonPropertyName("embedding")]
    public float[]? Embedding { get; set; }
}
