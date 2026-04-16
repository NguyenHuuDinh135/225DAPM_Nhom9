using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace backend.Application.TreeIncidents;

public static class DependencyInjection
{
    public static IServiceCollection AddTreeIncidentsServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        return services;
    }
}
