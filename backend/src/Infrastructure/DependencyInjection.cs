using backend.Application.Common.Interfaces;
using backend.Domain.Constants;
using backend.Infrastructure.Data;
using backend.Infrastructure.Data.Interceptors;
using backend.Infrastructure.Files;
using backend.Infrastructure.Identity;
using backend.Infrastructure.Services;
using backend.Infrastructure.Storage;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("QLCayXanhDb") 
                               ?? builder.Configuration.GetConnectionString("backendDb");

        builder.Services.AddScoped<ISaveChangesInterceptor, AuditableEntityInterceptor>();
        builder.Services.AddScoped<ISaveChangesInterceptor, DispatchDomainEventsInterceptor>();

        builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            if (!string.IsNullOrEmpty(connectionString))
                options.UseNpgsql(connectionString);
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });

        // Let Aspire enrich the DbContext with health checks, tracing, etc.
        if (!string.IsNullOrEmpty(connectionString))
            builder.EnrichNpgsqlDbContext<ApplicationDbContext>();

        builder.Services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<ApplicationDbContextInitialiser>();

        builder.Services.AddAuthentication()
            .AddBearerToken(IdentityConstants.BearerScheme);

        builder.Services.AddAuthorizationBuilder();

        builder.Services
            .AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddApiEndpoints();

        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddTransient<IIdentityService, IdentityService>();

        builder.Services.AddAuthorization(options =>
            options.AddPolicy(Policies.CanPurge, policy => policy.RequireRole(Roles.Administrator)));

        // Redis — optional, only when connection string is available
        var redisConnectionString = builder.Configuration.GetConnectionString("cache");
        if (!string.IsNullOrEmpty(redisConnectionString))
        {
            builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            builder.Services.AddSingleton<RedisCacheService>();
            builder.Services.AddSingleton<IRedisCacheService>(sp => sp.GetRequiredService<RedisCacheService>());
            builder.Services.AddSingleton<ICacheService>(sp => sp.GetRequiredService<RedisCacheService>());
        }
        else
        {
            builder.Services.AddSingleton<ICacheService, NullCacheService>();
        }

        builder.Services.AddTransient<IExcelService, ExcelService>();
        builder.Services.AddScoped<IMaintenanceJobService, MaintenanceJobService>();
        builder.Services.AddScoped<IFileService, FileService>();

        // Hangfire — only configure when connection string is available
        if (!string.IsNullOrEmpty(connectionString))
        {
            builder.Services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(connectionString)));
            builder.Services.AddHangfireServer();
        }
    }
}
