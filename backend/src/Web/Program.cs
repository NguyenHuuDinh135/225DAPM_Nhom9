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
    await app.InitialiseDatabaseAsync();
    app.UseHangfireDashboard("/hangfire");
}
else
{
    app.UseHsts();
}

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

RecurringJob.AddOrUpdate<IMaintenanceJobService>(
    "tree-maintenance",
    svc => svc.CheckAndGenerateMaintenanceWorkAsync(CancellationToken.None),
    Cron.Daily);

app.Run();

public partial class Program { }
