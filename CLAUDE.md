# CLAUDE.md — 225DAPM (Group 9) Development Guide

## 1. Karpathy-Inspired Development Philosophy
- **Simplicity Above All:** Write explicit, readable code. Avoid unnecessary abstractions or "clever" one-liners.
- **Understand the Stack:** Always be aware of how data flows from the .NET 10 Backend (Domain -> Application -> Infrastructure) to the Next.js Frontend.
- **First Principles Debugging:** When an error occurs, investigate the root cause (e.g., DB constraints, DI container) rather than just patching the symptom.
- **AI-Native Workflow:** Provide specific file context. Use short, iterative loops: Code -> Test -> Refine.

## 2. Essential Commands

### Backend (.NET 10, Aspire & Clean Architecture)
- **Restore & Build:** `dotnet restore`
- **Run Application (Aspire Dashboard):** `dotnet run --project backend/src/AppHost/AppHost.csproj` *(Ưu tiên dùng để chạy full stack API, DB...)*
- **Run Web API Directly:** `dotnet run --project backend/src/Web/Web.csproj`

#### Database (EF Core)
- Add Migration: `dotnet ef migrations add <Name> --project backend/src/Infrastructure --startup-project backend/src/Web`
- Update Database: `dotnet ef database update --project backend/src/Web`

#### Testing
- Unit & Functional Tests: `dotnet test` (Sử dụng NUnit, Shouldly, Moq và Respawn).

#### Code Generation (CQRS Use Cases)
Luôn `cd` vào thư mục `backend/src/Application` trước khi chạy các lệnh tạo Use Case này:
- **Tạo một Command mới:**
  `dotnet new ca-usecase --name <CommandName> --feature-name <FeatureFolder> --usecase-type command --return-type <Type>`
  *Ví dụ:* `dotnet new ca-usecase -n CreateTodoList -fn TodoLists -ut command -rt int`
- **Tạo một Query mới:**
  `dotnet new ca-usecase -n <QueryName> -fn <FeatureFolder> -ut query -rt <ReturnType>`
  *Ví dụ:* `dotnet new ca-usecase -n GetTodos -fn TodoLists -ut query -rt TodosVm`
  *(Các tham số viết tắt: `-n` = Name, `-fn` = Feature Name, `-ut` = Usecase Type, `-rt` = Return Type)*

### Frontend (Next.js & Bun)f
- **Install Deps:** `bun install` (run in `frontend/` directory)
- **Dev Server:** `bun run dev` (run in `frontend/apps/web/`)
- **Lint & Format:** `bun run lint` && `bun run format`
- **E2E Testing:** `bun run test:e2e`

## 3. Architecture & Coding Standards

### Backend Architecture (Clean Architecture)
1.  **Domain:** Pure business logic (Entities, Enums, Exceptions). Zero dependencies.
2.  **Application:** MediatR Commands/Queries, **FluentValidation** cho request validation, và **AutoMapper** cho mapping profiles.
3.  **Infrastructure:** Implementation of DB context (EF Core), Identity, and External Services.
4.  **Web:** Minimalist Endpoints (ASP.NET Core), Middleware, API config, và sử dụng **Scalar** thay cho Swagger để làm API documentation.

### Coding Rules
- **Backend:**
    - Use **Result Pattern** for business failures instead of throwing exceptions.
    - Follow **CQRS** pattern strictly using MediatR.
    - Methods and Classes must use `PascalCase`.
- **Frontend:**
    - Prefer **React Server Components (RSC)** for data-heavy pages.
    - Use **Tailwind CSS** for all styling; maintain design tokens in `tailwind.config.js`.
    - **No `any`**: Strict TypeScript interfaces for all API responses and component props.
    - **Routing Strictness:** File root của ứng dụng chỉ được dùng để điều hướng (navigation/routing) và tuyệt đối không được chứa các shared layouts.

## 4. AI-Native Collaboration (How to use Claude/Cursor)
- **Context is King:** When adding a feature, mention the specific layers (e.g., "Add a Tree entity to Domain and a CreateTreeCommand to Application").
- **Generate over Write:** Nếu cần thêm CRUD hoặc use case mới ở backend, hãy chủ động dùng lệnh `dotnet new ca-usecase` thay vì tạo file thủ công.
- **Minimalist Instructions:** Give Claude clear, atomic tasks. Avoid giant prompts that lead to hallucinations.
- **Verification:** Always ask Claude to write a test case (Unit or Functional) for new business logic.
- **Zero-Inference:** If a file path is ambiguous, explicitly provide it (e.g., `backend/src/Web/Program.cs`).

## 5. Infrastructure & CI/CD
- **Azure Bicep & Aspire:** Infrastructure is code. Modify files in `backend/infra/` hoặc project `AppHost` để thay đổi tài nguyên cloud.
- **GitHub Actions:** CI/CD pipeline is in `.github/workflows/azure-dev.yml`. Ensure all tests pass before merging.

💡 *Note: Keep your environment variables synchronized between `.env.local` (Frontend) and `appsettings.json` (Backend).*