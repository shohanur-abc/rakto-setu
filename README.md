# RaktoSetu (রক্তসেতু) — Community Blood Bank Platform

RaktoSetu ("blood bridge") is a lightweight, locally focused platform that connects people who **need blood** with people **willing to donate it**, scoped to a single thana (upazila) in Bangladesh. Blood is rarely held in screened inventory at the local level — most transfusions happen by finding a matching, willing donor fast. RaktoSetu treats donor availability as the primary supply and builds a fast, trustworthy matching layer around it.

It is a coordination platform, not a medical system — it never screens, tests, or certifies blood safety; that responsibility stays with the treating hospital.

Full product/feature spec, API spec, and database schema live in [`docs/`](./docs).

## Who uses it

- **Public visitor** — search donor availability and browse active requests without an account.
- **Recipient** — raise a blood request and reach a matching donor.
- **Donor** — register, toggle availability, and accept/decline requests.
- **Admin** — review/publish requests, verify donors, moderate, and monitor via a dashboard.

Contact details between a donor and recipient are only revealed after a donor **accepts** a specific request; every new request is gated behind admin review before it goes public. See [`docs/01-core-features.md`](./docs/01-core-features.md) for the full business rules and request lifecycle.

## Monorepo layout

Turborepo + pnpm workspaces.

```text
apps/
  server/   NestJS API (Prisma + PostgreSQL/NeonDB)
  client/   Vite + React SPA
packages/
  ui/                 Shared shadcn/ui component library (@workspace/ui)
  eslint-config/      Shared ESLint config
  typescript-config/  Shared tsconfig base
docs/       Product spec, API spec, database schema
```

`client` generates its typed API client from the server's OpenAPI spec via Orval (`api:generate`), so treat `server` as the source of truth for API contracts.

## Prerequisites

- Node.js >= 20
- pnpm 11
- A PostgreSQL database (this project is set up for [Neon](https://neon.tech), see [`apps/server/.env.example`](./apps/server/.env.example))

## Getting started

```bash
pnpm install

# apps/server/.env — copy from .env.example and fill in DATABASE_URL / DIRECT_URL, JWT_SECRET, etc.
cp apps/server/.env.example apps/server/.env

pnpm --filter server prisma:generate
pnpm --filter server prisma:migrate   # applies migrations
pnpm --filter server prisma:seed      # optional demo data

pnpm dev   # runs all apps via turbo
```

Root scripts (proxied through Turbo to every app): `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm format`, `pnpm typecheck`.

## Server (`apps/server`)

NestJS API using Prisma with the `@prisma/adapter-pg` driver adapter (connection string is read from `DATABASE_URL` at runtime; migrations run against `DIRECT_URL`, Neon's non-pooled connection). See [`apps/server/README.md`](./apps/server/README.md) for Nest-specific commands, and [`docs/02-api-specification.md`](./docs/02-api-specification.md) / [`docs/03-database-schema.md`](./docs/03-database-schema.md) for the full endpoint and schema reference.

Key scripts (run with `pnpm --filter server <script>`):

| Script | Purpose |
| --- | --- |
| `dev` | Start Nest in watch mode |
| `prisma:generate` | Regenerate the Prisma client |
| `prisma:migrate` | Run `prisma migrate dev` |
| `prisma:seed` | Load demo data from `prisma/seed-data/demo.sql` |
| `prisma:studio` | Open Prisma Studio |
| `openapi:generate` | Build and emit the OpenAPI spec consumed by `web`/`spa` |
| `test` / `test:e2e` | Unit / e2e tests (Vitest) |

## Web app (`apps/client`)

Vite + React SPA. Shares the `@workspace/ui` component package and pulls its API client from the server via `pnpm api:generate`.

## Running with Docker

The whole stack (API + SPA dev server) runs with a single command — no local Node/pnpm setup required:

```bash
docker compose up --build
```

This starts two services, networked together:

- **server** — built from [`apps/server/Dockerfile`](./apps/server/Dockerfile), runs the compiled Nest app on port `5000` inside the container (published as `http://localhost:5050` on the host). Reads its environment from `apps/server/.env`, so make sure `DATABASE_URL`/`DIRECT_URL` point at a real Postgres/Neon instance before starting.
- **client** — built from [`apps/client/Dockerfile`](./apps/client/Dockerfile), runs the Vite dev server on `http://localhost:5173`. Its dev-server proxy (`/api/*`) is pointed at the `server` container via the `PROXY_TARGET` env var (`http://server:5000`), so the SPA talks to the API over the Docker network exactly like it would to `localhost:5000` in local dev — no CORS/cookie issues.

Both Dockerfiles share a BuildKit cache mount for the pnpm store, so rebuilds after a dependency change only re-download what's new. Open `http://localhost:5173` once both containers are up.
