# Frontend — Quan Ly Cay Xanh

Next.js 16 + Bun + Turborepo monorepo with shadcn/ui.

## Scripts

<!-- AUTO-GENERATED -->
| Command | Description |
|---------|-------------|
| `bun install` | Install all workspace dependencies |
| `bun turbo dev` | Run all workspaces in dev mode |
| `bun run dev` (from `apps/web`) | Web app only (Turbopack, port 3000) |
| `bun run lint` | ESLint across monorepo |
| `bun run typecheck` | TypeScript check (`tsc --noEmit`) across monorepo |
| `bun run build` | Production build (all workspaces) |
| `bun run test:e2e` (from `apps/web`) | Playwright E2E tests |
<!-- END AUTO-GENERATED -->

## Adding UI Components

```bash
bunx shadcn@latest add button -c apps/web
```

Components are placed in `packages/ui/src/components/`.

## Using Components

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Workspaces

| Package | Path | Purpose |
|---------|------|---------|
| `web` | `apps/web/` | Main Next.js 16 application |
| `mobile` | `apps/mobile/` | Expo (React Native) — skeleton |
| `@workspace/ui` | `packages/ui/` | Shared component library (shadcn/ui + MapLibre) |
