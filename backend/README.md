# Backend — Quan Ly Cay Xanh

.NET 10 API using Clean Architecture (based on [jasontaylordev/CleanArchitecture](https://github.com/jasontaylordev/CleanArchitecture) v10.0.0-preview).

## Run

<!-- AUTO-GENERATED -->
| Command | Description |
|---------|-------------|
| `dotnet run --project src/AppHost` | Full stack via Aspire (auto-provisions PostgreSQL + Redis, port 5000) |
| `dotnet run --project src/Web` | API only (requires external database connection string) |
| `dotnet build src/Web/Web.csproj -c Release` | Release build check |
| `dotnet test backend.slnx` | Run all tests (NUnit + Shouldly + Moq + Respawn) |
| `dotnet test tests/Application.UnitTests/` | Application unit tests only |
| `dotnet test tests/Domain.UnitTests/` | Domain unit tests only |
| `dotnet test tests/Application.FunctionalTests/` | Functional tests (needs DB) |
<!-- END AUTO-GENERATED -->

## Code Scaffolding (CQRS)

From `src/Application/`:

```bash
dotnet new ca-usecase -n CreateTree -fn Trees -ut command -rt int
dotnet new ca-usecase -n GetTreesMap -fn Trees -ut query -rt TreeMapVm
```

If `ca-usecase` template is missing:
```bash
dotnet new install Clean.Architecture.Solution.Template::10.0.0-preview
```

## EF Core Migrations

```bash
dotnet ef migrations add <Name> --project src/Infrastructure --startup-project src/Web
dotnet ef database update --project src/Web
```

## Code Style

EditorConfig (`.editorconfig`) enforces formatting. Run `dotnet format` to auto-fix.