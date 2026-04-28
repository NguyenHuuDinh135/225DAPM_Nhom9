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
        app.UseHangfireDashboard("/hangfire");
    }
}
else
{
    app.UseHsts();
}

app.UseCors();
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

// Add role claims to authenticated users
app.UseMiddleware<backend.Web.Infrastructure.RoleClaimsMiddleware>();

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

if (app.Configuration.GetConnectionString("QLCayXanhDb") is not null || app.Configuration.GetConnectionString("backendDb") is not null)
{
    RecurringJob.AddOrUpdate<IMaintenanceJobService>(
        "tree-maintenance",
        svc => svc.CheckAndGenerateMaintenanceWorkAsync(CancellationToken.None),
        Cron.Daily);
}

app.Run();

public partial class Program { }
