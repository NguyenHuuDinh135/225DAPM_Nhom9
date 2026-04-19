namespace backend.Web.Endpoints;

public class TreeIncidents : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateTreeIncident, "report-incident")
            .MapGet(GetIncidentsByLocation, "nearby")
            .MapPut(UpdateIncidentStatus, "{id}/status");
    }

    // Sử dụng [FromForm] để nhận Multipart Data (có chứa Files)
    public async Task<Guid> CreateTreeIncident(ISender sender, [FromForm] CreateTreeIncidentCommand command)
    {
        return await sender.Send(command);
    }
    public async Task<IResult> UpdateIncidentStatus(ISender sender, Guid id, [FromBody] UpdateTreeIncidentStatusCommand command)
    {
        if (id != command.Id) return Results.BadRequest();
        await sender.Send(command);
        return Results.NoContent();
    }
}
