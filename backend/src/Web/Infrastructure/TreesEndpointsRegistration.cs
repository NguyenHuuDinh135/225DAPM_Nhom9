using backend.Web.Endpoints;

namespace backend.Web.Infrastructure;

public static class TreesEndpointsRegistration
{
    public static void RegisterTreesEndpoints(this WebApplication app)
    {
        app.MapTreesEndpoints();
    }
}
