var builder = DistributedApplication.CreateBuilder(args);

var databaseName = "backendDb";

// Tạo parameter password cố định (bí mật)
var postgresPassword = builder.AddParameter("postgres-password", "123", secret: true); // Đổi "123" thành password bạn muốn

var postgres = builder
    .AddPostgres("postgres", 
                 password: postgresPassword,   // Fix password
                 port: 5432)                   // Fix port host = 5432
    .WithEnvironment("POSTGRES_DB", databaseName);

var database = postgres.AddDatabase(databaseName);

builder.AddProject<Projects.Web>("web")
    .WithReference(database)
    .WaitFor(database);

builder.Build().Run();
