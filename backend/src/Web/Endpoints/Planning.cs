using backend.Application.Planning.Commands.ApprovePlan;
using backend.Application.Planning.Commands.CreatePlan;
using backend.Application.Planning.Commands.DeletePlan;
using backend.Application.Planning.Commands.UpdatePlan;
using backend.Application.Planning.Queries.GetPlans;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Planning : EndpointGroupBase
{
    public override void Map(RouteGroupBuilder groupBuilder)
    {
        groupBuilder.MapGet(GetPlans).RequireAuthorization();
        groupBuilder.MapPost(CreatePlan).RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapPut(UpdatePlan, "{id}").RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapDelete(DeletePlan, "{id}").RequireAuthorization(Roles.Manager, Roles.Admin);
        groupBuilder.MapPut(ApprovePlan, "{id}/approve").RequireAuthorization(Roles.Manager, Roles.Admin);
    }

    public async Task<Ok<List<PlanDto>>> GetPlans(ISender sender)
    {
        var result = await sender.Send(new GetPlansQuery());
        return TypedResults.Ok(result);
    }

    public async Task<Created<int>> CreatePlan(ISender sender, CreatePlanCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/Planning/{id}", id);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> UpdatePlan(ISender sender, int id, UpdatePlanCommand command)
    {
        var cmd = command with { Id = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> DeletePlan(ISender sender, int id)
    {
        var result = await sender.Send(new DeletePlanCommand(id));
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }

    public async Task<Results<NoContent, BadRequest<string[]>>> ApprovePlan(ISender sender, int id, ApprovePlanCommand command)
    {
        var cmd = command with { Id = id };
        var result = await sender.Send(cmd);
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
