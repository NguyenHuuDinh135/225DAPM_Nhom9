using backend.Application.Common.Interfaces;
using backend.Infrastructure.Data;
using backend.Web.Hubs;
using Hangfire;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.AddServiceDefaults();
builder.AddKeyVaultIfConfigured();
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddWebServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    if (app.Configuration.GetConnectionString("QLCayXanhDb") is not null || app.Configuration.GetConnectionString("backendDb") is not null)
    {
        await app.InitialiseDatabaseAsync();
    }
}
else
{
    app.UseHsts();
}

if (app.Configuration.GetConnectionString("QLCayXanhDb") is not null || app.Configuration.GetConnectionString("backendDb") is not null)
{
    app.UseHangfireDashboard("/hangfire");
}

app.UseCors();
app.UseRateLimiter();
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseSwaggerUi(settings =>
{
    settings.Path = "/api";
    settings.DocumentPath = "/api/specification.json";
});

app.UseExceptionHandler(options => { });

app.Map("/", () => Results.Redirect("/api"));

app.MapDefaultEndpoints();
app.MapEndpoints();
app.MapHub<IncidentHub>("/hubs/incidents");

if (!app.Environment.IsEnvironment("Testing") && (app.Configuration.GetConnectionString("QLCayXanhDb") is not null || app.Configuration.GetConnectionString("backendDb") is not null))
{
    var jobManager = app.Services.GetService<IRecurringJobManager>();
    if (jobManager is not null)
    {
        jobManager.AddOrUpdate<IMaintenanceJobService>(
            "tree-maintenance",
            svc => svc.CheckAndGenerateMaintenanceWorkAsync(CancellationToken.None),
            Cron.Daily);
    }
}

app.Run();

public partial class Program { }
