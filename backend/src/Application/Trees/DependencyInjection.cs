using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace backend.Application.Trees;

public static class DependencyInjection
{
    public static IServiceCollection AddTreesServices(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        return services;
    }
}
