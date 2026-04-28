using backend.Application.Planning.Commands.ApprovePlan;
using backend.Application.Planning.Commands.CreatePlan;
using backend.Application.Planning.Commands.DeletePlan;
using backend.Application.Planning.Commands.UpdatePlan;
using backend.Application.Planning.Queries.GetPlanDetail;
using backend.Application.Planning.Queries.GetPlans;
using backend.Domain.Constants;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Web.Endpoints;

public class Planning : EndpointGroupBase
{
    public override string? GroupName => "planning";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
<<<<<<< HEAD
        groupBuilder.MapGet(GetPlans).AllowAnonymous(); // Tạm thời để test
        groupBuilder.MapGet(GetPlanDetail, "{id}").AllowAnonymous();
        groupBuilder.MapPost(CreatePlan).AllowAnonymous(); // Tạm thời để test
        groupBuilder.MapPut(UpdatePlan, "{id}").AllowAnonymous();
        groupBuilder.MapDelete(DeletePlan, "{id}").AllowAnonymous();
        groupBuilder.MapPut(ApprovePlan, "{id}/approve").AllowAnonymous();
=======
        groupBuilder.MapGet(GetPlans).RequireAuthorization();
        groupBuilder.MapGet(GetPlanDetail, "{id}").RequireAuthorization();
        groupBuilder.MapPost(CreatePlan).RequireAuthorization(Roles.Manager);
        groupBuilder.MapPut(UpdatePlan, "{id}").RequireAuthorization(Roles.Manager);
        groupBuilder.MapDelete(DeletePlan, "{id}").RequireAuthorization(Roles.Manager);
        groupBuilder.MapPut(ApprovePlan, "{id}/approve").RequireAuthorization(Roles.Manager, Roles.Admin, Roles.Administrator);
>>>>>>> bad814c0a4bc39e490ebbf32052bc69716786855
    }

    public async Task<Ok<List<PlanDto>>> GetPlans(ISender sender)
        => TypedResults.Ok(await sender.Send(new GetPlansQuery()));

    public async Task<Ok<PlanDetailVm>> GetPlanDetail(ISender sender, int id)
        => TypedResults.Ok(await sender.Send(new GetPlanDetailQuery(id)));

    public async Task<Created<int>> CreatePlan(ISender sender, CreatePlanCommand command)
    {
        var id = await sender.Send(command);
        return TypedResults.Created($"/Planning/{id}", id);
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

    public async Task<Results<NoContent, BadRequest<string[]>>> ApprovePlan(ISender sender, int id, ApprovePlanCommand command)
    {
        var result = await sender.Send(command with { Id = id });
        return result.Succeeded ? TypedResults.NoContent() : TypedResults.BadRequest(result.Errors);
    }
}
