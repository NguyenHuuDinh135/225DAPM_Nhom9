namespace backend.Infrastructure.AI;

public class OllamaOptions
{
    public const string SectionName = "Ollama";
    public string BaseUrl { get; set; } = "http://localhost:11434";
    public string DefaultModel { get; set; } = "qwen2.5:7b";
    public string FastModel { get; set; } = "qwen2.5-coder:0.5b";
    public string EmbeddingModel { get; set; } = "nomic-embed-text";
    public int TimeoutSeconds { get; set; } = 60;
    public int MaxTokens { get; set; } = 2048;
}
