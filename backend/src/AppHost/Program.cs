var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithLifetime(ContainerLifetime.Session)
    .WithPgAdmin()
    .AddDatabase("QLCayXanhDb");

var redis = builder.AddRedis("cache");

builder.AddProject<Projects.Web>("api")
    .WithEndpoint("http", e => e.Port = 5000)
    .WithReference(postgres)
    .WithReference(redis)
    .WaitFor(postgres)
    .WaitFor(redis);

builder.Build().Run();
