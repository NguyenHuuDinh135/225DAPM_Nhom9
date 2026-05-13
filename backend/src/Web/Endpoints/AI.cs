using backend.Application.AI.Commands.Chat;
using backend.Application.AI.Queries.DetectAnomalies;
using backend.Application.AI.Queries.GenerateReport;
using backend.Application.AI.Queries.PredictMaintenance;
using backend.Application.Common.Interfaces;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class AI : EndpointGroupBase
{
    public override string? GroupName => "ai";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapPost(Chat, "chat").RequireAuthorization();
        groupBuilder.MapGet(DetectAnomalies, "anomalies").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapGet(GenerateReport, "report/{type}").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapGet(PredictMaintenance, "predictions").RequireAuthorization(new AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
        groupBuilder.MapGet(HealthCheck, "health").AllowAnonymous();
    }

    public record ChatRequest(string Message, List<ChatMessageDto>? History);
    public record ChatResponse(string Response);

    public async Task<Ok<ChatResponse>> Chat(ISender sender, ChatRequest request)
    {
        var result = await sender.Send(new ChatCommand
        {
            Message = request.Message,
            History = request.History
        });

        return TypedResults.Ok(new ChatResponse(result));
    }

    public async Task<Ok<List<int>>> DetectAnomalies(ISender sender)
        => TypedResults.Ok(await sender.Send(new DetectAnomaliesQuery()));

    public async Task<Ok<string>> GenerateReport(ISender sender, string type)
        => TypedResults.Ok(await sender.Send(new GenerateReportQuery(type)));

    public async Task<Ok<List<MaintenancePrediction>>> PredictMaintenance(ISender sender)
        => TypedResults.Ok(await sender.Send(new PredictMaintenanceQuery()));

    public record HealthResponse(bool Available);

    public async Task<Ok<HealthResponse>> HealthCheck(IAIService aiService)
    {
        var available = await aiService.IsAvailableAsync();
        return TypedResults.Ok(new HealthResponse(available));
    }
}
