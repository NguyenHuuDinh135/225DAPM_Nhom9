using backend.Application.Common.Interfaces;

namespace backend.Application.AI.Commands.Chat;

public record ChatCommand : IRequest<string>
{
    public string Message { get; init; } = string.Empty;
    public List<ChatMessageDto>? History { get; init; }
}

public record ChatMessageDto(string Role, string Content);

public class ChatCommandValidator : AbstractValidator<ChatCommand>
{
    public ChatCommandValidator()
    {
        RuleFor(x => x.Message).NotEmpty().WithMessage("Message is required.");
    }
}

public class ChatCommandHandler : IRequestHandler<ChatCommand, string>
{
    private readonly IAIService _aiService;

    public ChatCommandHandler(IAIService aiService)
    {
        _aiService = aiService;
    }

    public async Task<string> Handle(ChatCommand request, CancellationToken cancellationToken)
    {
        var history = request.History?
            .Select(h => new ChatMessage(h.Role, h.Content))
            .ToList();

        return await _aiService.ChatAsync(request.Message, history);
    }
}
