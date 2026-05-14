using backend.Application.Common.Interfaces;
using backend.Domain.Enums;

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
    private readonly IApplicationDbContext _context;

    public ChatCommandHandler(IAIService aiService, IApplicationDbContext context)
    {
        _aiService = aiService;
        _context = context;
    }

    public async Task<string> Handle(ChatCommand request, CancellationToken cancellationToken)
    {
        var systemContext = await BuildSystemContextAsync(cancellationToken);

        var history = request.History?
            .Select(h => new ChatMessage(h.Role, h.Content))
            .ToList() ?? new List<ChatMessage>();

        history.Insert(0, new ChatMessage("system", systemContext));

        return await _aiService.ChatAsync(request.Message, history);
    }

    private async Task<string> BuildSystemContextAsync(CancellationToken cancellationToken)
    {
        var totalTrees = await _context.Trees
            .AsNoTracking()
            .CountAsync(cancellationToken);

        var sauBenh = await _context.Trees
            .AsNoTracking()
            .CountAsync(t => t.Condition == "Sâu bệnh", cancellationToken);

        var canCatTia = await _context.Trees
            .AsNoTracking()
            .CountAsync(t => t.Condition == "Cần cắt tỉa", cancellationToken);

        var pendingIncidents = await _context.TreeIncidents
            .AsNoTracking()
            .CountAsync(i => i.Status == IncidentStatus.Pending, cancellationToken);

        var activeWorks = await _context.Works
            .AsNoTracking()
            .CountAsync(w => w.Status != WorkStatus.Completed && w.Status != WorkStatus.Cancelled, cancellationToken);

        var needsMaintenance = sauBenh + canCatTia;

        return $"""
            [DỮ LIỆU HỆ THỐNG HIỆN TẠI]
            - Tổng cây quản lý: {totalTrees}
            - Cây cần bảo trì: {needsMaintenance} (Sâu bệnh: {sauBenh}, Cần cắt tỉa: {canCatTia})
            - Sự cố đang chờ xử lý: {pendingIncidents}
            - Công tác đang thực hiện: {activeWorks}
            """;
    }
}
