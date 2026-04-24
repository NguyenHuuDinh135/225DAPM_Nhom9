namespace backend.Web.Endpoints;

public class Test : EndpointGroupBase
{
    public override string? GroupName => "test";

    public override void Map(RouteGroupBuilder groupBuilder)
    {
        // Simple test endpoint without authorization
        groupBuilder.MapGet("/ping", () => Results.Ok(new { message = "pong", timestamp = DateTime.UtcNow }))
            .AllowAnonymous();
        
        // Test POST endpoint without authorization
        groupBuilder.MapPost("/echo", (EchoRequest request) => Results.Ok(new { 
            received = request.Message, 
            timestamp = DateTime.UtcNow 
        }))
            .AllowAnonymous();
    }
}

public record EchoRequest(string Message);
