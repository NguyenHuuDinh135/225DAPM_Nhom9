namespace backend.Infrastructure.AI;

public class BedrockOptions
{
    public const string SectionName = "Bedrock";
    public string Region { get; set; } = "us-west-2";
    public string ModelId { get; set; } = "anthropic.claude-3-haiku-20240307";
    public int MaxTokens { get; set; } = 2048;
    public int TimeoutSeconds { get; set; } = 60;
}
