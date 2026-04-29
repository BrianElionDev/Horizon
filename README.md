# Horizon

A strategic product discovery and definition system. Takes raw ideas and transforms them into structured, validated product definitions ready for build.

## Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 (App Router) + Tailwind CSS + Radix UI |
| Backend | Fastify 5 + Supabase |
| Database | PostgreSQL (Supabase) |
| Shared | TypeScript + Zod |
| State | Zustand + TanStack React Query |
| Auth | JWT access tokens + HttpOnly refresh cookie |
| Deployment | Vercel (frontend + API) |

## Structure

```
apps/
  api/        Fastify REST API
  web/        Next.js frontend
packages/
  shared/     Shared types, validation schemas, constants
```

## Getting Started

**Prerequisites:** Node.js 20+, pnpm 10+

```bash
pnpm install
```

### Environment Variables

**`apps/api/.env`** — copy from `.env.example`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=                  # 64-char random string
JWT_ACCESS_EXPIRY=15m
FRONTEND_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

**`apps/web/.env.local`** — copy from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Dev

```bash
pnpm dev          # all apps
pnpm dev:api      # API only  (port 3001)
pnpm dev:web      # web only  (port 3000)
```

### Build

```bash
pnpm build
```

### Other

```bash
pnpm type-check
pnpm lint
pnpm db:seed
```

## Deployment

Both apps deploy to Vercel. Set `FRONTEND_URL` in the API project's env vars as a comma-separated list of all allowed frontend origins:

```
FRONTEND_URL=https://your-frontend.vercel.app,https://preview-url.vercel.app
```
