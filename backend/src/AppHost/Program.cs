using Microsoft.Extensions.Configuration;

var builder = DistributedApplication.CreateBuilder(args);

var usePersistentPostgresVolume = builder.Configuration.GetValue<bool>("Aspire:Postgres:UsePersistentVolume");

var postgres = builder.AddPostgres("postgres")
    .WithLifetime(ContainerLifetime.Session)
    .WithPgAdmin();

if (usePersistentPostgresVolume)
{
    postgres = postgres.WithDataVolume();
}

var postgresDb = postgres.AddDatabase("QLCayXanhDb");

var redis = builder.AddRedis("cache");

builder.AddProject<Projects.Web>("api")
    .WithEndpoint("http", e => e.Port = 5000)
    .WithReference(postgresDb)
    .WithReference(redis)
    .WaitFor(postgresDb)
    .WaitFor(redis);

builder.Build().Run();
