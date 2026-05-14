# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Quản Lý Cây Xanh** — Urban tree management system for Da Nang city. Three user roles: Giám Đốc (Director, approves plans), Đội Trưởng (Team Captain, manages trees/plans/work), Nhân Viên (Field Worker, executes tasks and reports progress).

## Commands

### Full Stack Development
```bash
./dev.sh                  # Starts AppHost (BE + PostgreSQL + Redis) then frontend
./run-apphost.sh          # Backend only (Aspire with dashboard disabled, port 5000)
```

### Backend (.NET 10, Aspire + Clean Architecture)
```bash
dotnet run --project backend/src/AppHost/AppHost.csproj   # Full stack via Aspire (port 5000)
dotnet run --project backend/src/Web/Web.csproj           # API only (needs external DB)
dotnet build backend/src/Web/Web.csproj -c Release        # Build check
dotnet test backend/backend.slnx                          # All tests (NUnit + Shouldly + Moq + Respawn)
dotnet test backend/tests/Application.UnitTests/          # Application unit tests
dotnet test backend/tests/Domain.UnitTests/               # Domain unit tests
dotnet test backend/tests/Application.FunctionalTests/    # Functional tests (needs DB)
dotnet test backend/tests/Infrastructure.IntegrationTests/ # Infrastructure integration tests
```

#### EF Core Migrations
```bash
dotnet ef migrations add <Name> --project backend/src/Infrastructure --startup-project backend/src/Web
dotnet ef database update --project backend/src/Web
```

#### CQRS Code Generation (run from `backend/src/Application/`)
```bash
dotnet new ca-usecase -n <Name> -fn <FeatureFolder> -ut command -rt <ReturnType>
dotnet new ca-usecase -n <Name> -fn <FeatureFolder> -ut query -rt <ReturnType>
```

### Frontend (Next.js 16 + Bun + Turborepo)
```bash
cd frontend && bun install                    # Install deps
cd frontend && bun turbo dev                  # All workspaces in dev mode
cd frontend/apps/web && bun run dev           # Web only (Turbopack, port 3000)
cd frontend && bun run lint                   # ESLint across monorepo
cd frontend && bun run typecheck              # tsc --noEmit across monorepo
cd frontend/apps/web && bun run test:e2e      # Playwright E2E
```

### Infrastructure
```bash
cd infra/environments/prod && terraform plan   # Preview AWS changes
```

## Architecture

### Backend — Request Lifecycle

```
HTTP → Minimal API Endpoint (Web/) → ISender.Send(Command/Query)
  → MediatR Pipeline: Logging → UnhandledException → Authorization → Validation → Performance → Handler
  → Handler uses IApplicationDbContext (EF Core + PostgreSQL)
  → SaveChanges triggers: AuditableEntityInterceptor + DispatchDomainEventsInterceptor
  → Returns Result<T> (commands) or DTO (queries)
```

Endpoints inherit `EndpointGroupBase` and are auto-discovered. Each maps to a feature area (Trees, Plans, Works, Users, Incidents, AI).

### Backend — Layer Responsibilities

| Layer | Path | Rule |
|-------|------|------|
| Domain | `backend/src/Domain/` | Pure entities with behaviour methods (`Tree.Relocate()`, `Plan.Approve()`). Factory via `static Create()`. Zero dependencies. |
| Application | `backend/src/Application/` | Feature folders (Trees, Planning, WorkItems, TreeIncidents, Employees, Identity, Locations, Lookups, Maintenance, Reports, AI) with colocated Command + Validator + Handler. Returns `Result<T>` for mutations. |
| Infrastructure | `backend/src/Infrastructure/` | EF Core context, Identity, Redis cache, file storage, Ollama AI integration, Hangfire. |
| Web | `backend/src/Web/` | Minimal API endpoints, CORS, JWT config, SignalR hub, NSwag OpenAPI. |

### Frontend — Structure

```
frontend/
├── apps/web/          # Next.js 16 (main app)
│   ├── app/(app)/     # Public pages (no auth) — citizen portal, incident reporting
│   ├── app/(dashboard)/ # Authenticated pages — tree CRUD, plans, work management
│   ├── app/giamdoc/   # Director hub
│   ├── app/doitruong/  # Team captain hub
│   ├── app/nhanvien/   # Field worker hub
│   ├── lib/api-client.ts    # Central fetch wrapper (injects Bearer token)
│   ├── hooks/use-auth.tsx   # AuthProvider context (login/logout/token)
│   └── middleware.ts        # RBAC routing — reads JWT role, redirects accordingly
├── apps/mobile/       # Expo (React Native) — skeleton, not production-ready
└── packages/ui/       # Shared component library (@workspace/ui)
    └── src/components/ui/map.tsx  # MapLibre GL wrapper (Map, Marker, Popup, Route, ClusterLayer)
```

### API Proxy Pattern

`next.config.mjs` rewrites:
- `/api/:path*` → `http://localhost:5000/api/:path*`
- `/hubs/:path*` → `http://localhost:5000/hubs/:path*`
- `/uploads/:path*` → `http://localhost:5000/uploads/:path*`

Frontend never calls backend directly — always through the Next.js rewrite proxy.

### Auth Flow

1. `POST /api/Users/login` → returns `{accessToken}` (HS256 JWT, 7-day expiry)
2. Token stored in both `localStorage["access_token"]` + `SameSite=Lax` cookie (for SSR middleware)
3. `apiClient` injects `Authorization: Bearer` on all requests
4. `middleware.ts` decodes JWT role client-side → redirects to role-specific hub

### Real-Time (SignalR)

- Hub at `/hubs/incidents` (`IncidentHub` in Web layer)
- `INotificationService` broadcasts via `IHubContext<IncidentHub>` to all connected clients
- Frontend `NotificationListener` component auto-reconnects and shows Sonner toasts

### Map / GIS

- Engine: **MapLibre GL** (open-source, no API key) with CartoCDN tile layers
- Component library: `@workspace/ui/components/ui/map` — use `Map`, `MapMarker`, `MapPopup`, `MapControls`, `MapRoute`, `MapClusterLayer`
- Default center: Da Nang `[108.2149, 16.0644]`
- Tree data: `GET /api/trees/map` returns `TreeMapVm`
- Advanced features in `app/(dashboard)/components/map-features/`:
  - **Heatmap layer** — density visualization using MapLibre native heatmap
  - **Polygon draw + stats** — draw area, compute tree stats inside (uses @turf)
  - **Route optimizer** — select trees, TSP solver + OSRM routing
  - **Timeline slider** — filter trees by recorded date with play/pause animation
- Role-based map actions (`full-dashboard-map.tsx`):
  - **Admin (DoiTruong/GiamDoc)**: Add tree, relocate, approve/reject work items, delete trees
  - **NhanVien**: "Tuyến tôi" (auto-routes to assigned pending tasks), "Việc của tôi" layer filter, "Báo sự cố" from tree popup, "Báo cáo tiến độ" from assigned work item popup

### AI / LLM (Ollama)

- Engine: **Ollama** running locally at `http://localhost:11434`
- Models: `qwen2.5:7b` (reasoning), `qwen2.5-coder:0.5b` (fast classification), `nomic-embed-text` (embeddings)
- Configuration: `appsettings.json` → `Ollama` section (`OllamaOptions.cs`)
- Client: `Infrastructure/AI/OllamaClient.cs` — singleton HTTP client with generate/chat/embed methods
- Service: `Infrastructure/AI/AIService.cs` implements `IAIService` with graceful fallback to keyword matching if Ollama offline
- Endpoints: `POST /api/ai/chat`, `GET /api/ai/health`, `GET /api/ai/anomalies`, `GET /api/ai/predictions`, `GET /api/ai/report/{type}`
- Frontend: `AiChatPanel` (floating chat on all dashboard pages), `AiInsightsCard` (predictions + anomalies), `AiHealthBadge`
- All AI calls are non-blocking with try-catch — system works without Ollama running

## Domain Model (Key Entities)

| Entity | Purpose |
|--------|---------|
| `Tree` | Physical tree with GPS coords, condition, relocation count (max 3) |
| `TreeType` | Species with `MaintenanceIntervalDays` |
| `Plan` | Work plan with state machine: Draft → PendingApproval → NeedsRevision/Approved/Rejected → Completed/Cancelled |
| `Work` | Work order within a Plan: New → InProgress → WaitingForApproval → Completed/Cancelled |
| `WorkDetail` | Junction Work ↔ Tree |
| `WorkProgress` | Field report with percentage and images |
| `TreeIncident` | Reported incident with severity (Bình thường/Cao/Khẩn cấp) |

## Key Conventions

- **Result Pattern**: Commands return `Result<T>` — never throw for expected business failures
- **Entity behaviour**: Mutations live on the entity (`Plan.Approve(userId)`) not in handlers
- **Code generation**: Always use `dotnet new ca-usecase` for new commands/queries
- **API client**: All frontend fetches go through `lib/api-client.ts` — never raw `fetch()`
- **Map components**: Import from `@workspace/ui/components/ui/map` — never import `maplibre-gl` directly in app code
- **Notifications**: Use `INotificationService` for any action that should push real-time toasts
- **File uploads**: Use `IFileService` — saves to `wwwroot/uploads/<folder>/<guid.ext>`
- **Caching**: Use `ICacheService` interface (Redis in prod, NullCache locally)
- **Excel**: Use `IExcelService` (ClosedXML) for import/export features
- **Pagination**: Use `PaginatedList<T>` from `Application/Common/Models`
- **AI service**: Use `IAIService` interface — never call Ollama HTTP directly from handlers
- **AI prompts**: Vietnamese language prompts, responses parsed with fallback defaults

## CI/CD

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | PR to main | Build + test backend, lint + typecheck + build frontend, Playwright E2E |
| `deploy-api.yml` | Push to main | Docker build → ECR → ECS Fargate deploy |
| `deploy-web.yml` | Push to main | Bun build → S3 sync |
| `terraform.yml` | Manual | Terraform plan/apply for AWS infra |

## Infrastructure (AWS)

- ECS Fargate (1 vCPU / 2GB) behind ALB for the .NET API
- RDS PostgreSQL 15 (db.t3.medium, private subnet)
- S3 for frontend static hosting
- ECR for Docker images
- SSM Parameter Store for secrets
- Terraform in `infra/environments/prod/`

## Known Limitations

- No refresh token — sessions expire after 7 days with no renewal
- CORS is `SetIsOriginAllowed(_ => true)` — lock down before production
- AI requires Ollama running locally — no cloud fallback; qwen2.5:7b takes 10-50s on CPU-only hardware
- AI image verification (`VerifyWorkCompletionAsync`) analyzes metadata only — no vision model (no GPU)
- `NotificationListener` hardcodes `BASE_URL = "http://localhost:5000"` — needs env var for production
- Hangfire recurring job (`tree-maintenance`) is commented out in `Program.cs`
