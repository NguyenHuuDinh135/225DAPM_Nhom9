using backend.Application.Common.Interfaces;
using backend.Application.Planning.Commands.ApprovePlan;
using backend.Application.Planning.Commands.CreatePlan;
using backend.Application.Planning.Commands.DeletePlan;
using backend.Application.Planning.Commands.UpdatePlan;
using backend.Application.Planning.Commands.SubmitPlan;
using backend.Application.Planning.Commands.RejectPlan;
using backend.Application.Planning.Commands.RequestRevision;
using backend.Application.Planning.Queries.GetPlanDetail;
using backend.Application.Planning.Queries.GetPlans;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Security.Claims;

namespace backend.Web.Endpoints;

public class Planning : EndpointGroupBase
{
    public override string? GroupName => "planning";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
<<<<<<< HEAD
        groupBuilder.MapGet(GetPlans).RequireAuthorization();
        groupBuilder.MapGet(GetPlanDetail, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreatePlan).RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.DoiTruong });
        groupBuilder.MapPut(UpdatePlan, "{id}").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.DoiTruong });
        groupBuilder.MapDelete(DeletePlan, "{id}").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.DoiTruong });
        groupBuilder.MapPut(SubmitPlan, "{id}/submit").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.DoiTruong });
        groupBuilder.MapPut(ApprovePlan, "{id}/approve").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.GiamDoc });
        groupBuilder.MapPut(RejectPlan, "{id}/reject").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.GiamDoc });
        groupBuilder.MapPut(RequestRevision, "{id}/request-revision").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = Roles.GiamDoc });
        groupBuilder.MapGet(GetAISuggestions, "ai-suggestions").RequireAuthorization(new Microsoft.AspNetCore.Authorization.AuthorizeAttribute { Roles = $"{Roles.GiamDoc},{Roles.DoiTruong}" });
    }

    public record AISuggestionDto(string Message, List<int> SuggestedTreeIds, List<string> SuggestedTreeNames);

    public async Task<Ok<AISuggestionDto>> GetAISuggestions(IApplicationDbContext context, IAIService aiService)
    {
        var now = DateTime.UtcNow;
        var allTrees = await context.Trees
            .Include(t => t.TreeType)
            .ToListAsync();
        
        var overdueTrees = allTrees
            .Where(t => t.NeedsMaintenance(now))
            .ToList();

        var overdueNames = overdueTrees
            .Select(t => t.Name ?? "Cây không tên")
            .ToList();

        var overdueIds = overdueTrees
            .Select(t => t.Id)
            .ToList();

        var suggestionMessage = await aiService.SuggestMaintenancePlanAsync(overdueNames);
        
        return TypedResults.Ok(new AISuggestionDto(suggestionMessage, overdueIds, overdueNames));
=======
        // Temporary: Disable authorization for testing
        groupBuilder.MapGet(GetPlans).AllowAnonymous();
        groupBuilder.MapGet(GetPlanDetail, "{id}").AllowAnonymous();
        groupBuilder.MapPost(CreatePlan).AllowAnonymous();
        groupBuilder.MapPut(UpdatePlan, "{id}").AllowAnonymous();
        groupBuilder.MapDelete(DeletePlan, "{id}").AllowAnonymous();
        groupBuilder.MapPut(ApprovePlan, "{id}/approve").AllowAnonymous();
>>>>>>> main
    }

    public async Task<Ok<List<PlanDto>>> GetPlans(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetPlansQuery()));

    public async Task<Ok<PlanDetailVm>> GetPlanDetail(ISender sender, int id)
        => TypedResults.Ok(await sender.Send(new GetPlanDetailQuery(id)));

    public async Task<IResult> CreatePlan(ClaimsPrincipal principal, ISender sender, CreatePlanCommand command)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await sender.Send(command with { CreatorId = userId ?? command.CreatorId });
        return result.Succeeded ? Results.Created($"/Planning/{result.Value}", result.Value) : Results.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdatePlan(ISender sender, int id, UpdatePlanCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeletePlan(ISender sender, int id)
    {
        var result = await sender.Send(new DeletePlanCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> SubmitPlan(ISender sender, int id)
    {
        var result = await sender.Send(new SubmitPlanCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> ApprovePlan(ClaimsPrincipal principal, ISender sender, int id, ApprovePlanCommand command)
    {
        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var result = await sender.Send(command with { Id = id, ApproverId = userId ?? command.ApproverId });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> RejectPlan(ISender sender, int id, RejectPlanCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> RequestRevision(ISender sender, int id, RequestRevisionCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
