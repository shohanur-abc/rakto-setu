# RaktoSetu — Community Blood Donation Coordination Platform

**RaktoSetu (রক্তসেতু)** is a bilingual community blood-donation platform that connects people who need blood with nearby, willing donors. The application focuses on donor discovery, blood-request coordination, privacy-aware contact sharing, donor eligibility, notifications, and local administrative oversight.

> **Medical disclaimer:** RaktoSetu is a coordination platform, not a blood bank, diagnostic service, or medical screening system. Blood screening, cross-matching, collection, and transfusion must be performed by qualified healthcare professionals at an appropriate medical facility.

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Useful Commands](#useful-commands)
- [Blood Request Lifecycle](#blood-request-lifecycle)
- [Testing](#testing)
- [Security and Privacy](#security-and-privacy)
- [Project Documentation](#project-documentation)
- [License](#license)

## Overview

RaktoSetu is designed for local blood-donation coordination in Bangladesh. It provides a public discovery layer for blood availability while protecting personal contact information until a donor accepts a specific request.

The application supports:

- Public donor and blood-request discovery
- Recipient blood-request management
- Donor registration, availability, and eligibility tracking
- Donor–recipient matching and completion confirmation
- In-app notifications and announcements
- Role-based administration and moderation
- Bangla and English interfaces
- Responsive light and dark themes

## Core Features

### Public Access

- Search available donors by blood group and location
- View availability summaries by blood group
- Browse published blood requests
- Read donation eligibility guidance, FAQs, and compatibility information
- View public announcements

### Recipient Features

- Register and manage an account
- Create, edit, track, and cancel blood requests
- View accepted donor matches
- Confirm completed donations
- Receive request and donor-response notifications
- Review previous requests

### Donor Features

- Convert an existing account into a donor account
- Create and update a donor profile
- Toggle donation availability
- Browse compatible open requests
- Accept, decline, or cancel an accepted request
- Confirm donation completion
- View donation history and eligibility status

### Administrative Features

- View platform metrics
- Search, suspend, reactivate, or remove users
- Verify or reject donor profiles
- Review, publish, reject, assign, and close blood requests
- Create and manage announcements
- View reports and export report data as CSV
- Review moderation information
- Configure system settings such as donor cooldown periods
- Record sensitive actions in audit logs

## User Roles

| Role | Main Responsibility |
|---|---|
| Public visitor | Search donors, view requests, and access public information |
| Recipient | Create and manage blood requests |
| Donor | Respond to compatible requests and manage donation availability |
| Admin | Verify users, moderate requests, and manage system operations |

## Technology Stack

### Frontend

- [Next.js](https://nextjs.org/) 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui-based shared component package
- TanStack Query
- Axios
- Zustand
- Motion
- `next-themes`
- English and Bangla localization

### Backend

- NestJS 11
- TypeScript
- Prisma ORM 7
- PostgreSQL
- JWT authentication
- Swagger / OpenAPI
- Class Validator and Class Transformer
- API rate limiting with NestJS Throttler
- Vitest

### Monorepo Tooling

- pnpm workspaces
- Turborepo
- ESLint
- Prettier
- Orval-generated API client
- Bruno API collection

## System Architecture

```mermaid
flowchart LR
    U[Browser / User] --> W[Next.js Web App]
    W -->|REST API| S[NestJS API]
    S --> A[JWT Authentication and RBAC]
    S --> P[Prisma ORM]
    P --> D[(PostgreSQL)]
    S --> O[Swagger / OpenAPI]
    O --> C[Orval API Client]
    C --> W
```

The frontend runs on port `3000` by default. The backend should run on port `5000` during local development.

## Project Structure

```text
rakto-setu/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── server/                 # NestJS REST API
│       ├── bruno/              # Bruno API request collection
│       ├── prisma/             # Prisma schema and migrations
│       ├── scripts/            # OpenAPI and demo seed scripts
│       ├── src/                # Backend modules and services
│       └── test/               # End-to-end tests
├── packages/
│   ├── api-client/             # Orval-generated API client configuration
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── i18n/                   # English and Bangla translations
│   ├── typescript-config/      # Shared TypeScript configuration
│   └── ui/                     # Shared UI components
├── docs/
│   ├── 01-core-features.md
│   ├── 02-api-specification.md
│   └── 03-database-schema.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Getting Started

### Prerequisites

Install the following software:

- Node.js `20` or newer
- pnpm `11.9.0` or a compatible recent version
- PostgreSQL
- Git

Enable pnpm through Corepack when necessary:

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
```

### 1. Clone or Extract the Project

```bash
git clone <repository-url>
cd rakto-setu
```

When using the downloaded ZIP file, extract it and open a terminal in the extracted project directory.

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure the Backend

Copy the backend environment example:

```bash
cp apps/server/.env.example apps/server/.env
```

PowerShell equivalent:

```powershell
Copy-Item apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env` and set a valid PostgreSQL connection string and secure JWT secret.

**Important:** Set `PORT=5000`. The example file currently contains `PORT=3000`, which conflicts with the frontend development server.

### 4. Configure the Frontend

Create `apps/web/.env.local`:

```env
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api/v1
API_DOCS_URL=http://localhost:5000/api/docs-json
```

### 5. Prepare the Database

Create a PostgreSQL database named `rakto_setu`, or change the database name in `DATABASE_URL`.

Example connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rakto_setu?schema=public"
```

Generate the Prisma client and apply migrations:

```bash
pnpm --filter server prisma:generate
pnpm --filter server prisma:migrate
```

### 6. Seed Demo Data — Optional

The project contains a realistic demo seed script for locations, users, donors, requests, notifications, announcements, and settings.

```bash
pnpm --filter server exec tsx scripts/seed.ts
```

A larger deterministic fake dataset can be generated with:

```bash
pnpm --filter server prisma:seed:faker
```

Only run seed commands against a development database.

## Environment Variables

### Backend — `apps/server/.env`

| Variable | Required | Description | Example |
|---|---:|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/rakto_setu?schema=public` |
| `JWT_SECRET` | Yes | Secret used to sign authentication tokens | Use a long random value |
| `JWT_EXPIRES_IN` | No | JWT validity period | `7d` |
| `PORT` | No | Backend HTTP port | `5000` |
| `SEED_ADMIN_FULL_NAME` | No | Demo admin name | `RaktoSetu Admin` |
| `SEED_ADMIN_PHONE` | No | Demo admin phone | `+8801700000000` |
| `SEED_ADMIN_EMAIL` | No | Demo admin email | `admin@example.com` |
| `SEED_ADMIN_PASSWORD` | No | Demo admin password | Use only for local development |
| `SEED_DEMO_PASSWORD` | No | Password assigned to seeded demo users | Use only for local development |

### Frontend — `apps/web/.env.local`

| Variable | Required | Description | Default |
|---|---:|---|---|
| `API_URL` | Recommended | Backend origin used by Next.js rewrites | `http://localhost:5000` |
| `NEXT_PUBLIC_API_URL` | Recommended | Public API base URL | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public frontend URL | `http://localhost:3000` |
| `API_BASE_URL` | No | Server-side API base URL | `http://localhost:5000/api/v1` |
| `API_DOCS_URL` | No | OpenAPI JSON URL used by Orval | `http://localhost:5000/api/docs-json` |

Never commit real `.env` files or production credentials.

## Database Setup

The Prisma schema contains the following primary models:

- `User`
- `DonorProfile`
- `Location`
- `BloodRequest`
- `RequestResponse`
- `Donation`
- `Notification`
- `Announcement`
- `AuditLog`
- `AuthToken`
- `Setting`

Open Prisma Studio:

```bash
pnpm --filter server prisma:studio
```

Create a new development migration after changing the Prisma schema:

```bash
pnpm --filter server prisma:migrate
```

Regenerate the Prisma client:

```bash
pnpm --filter server prisma:generate
```

## Running the Application

Start the complete monorepo in development mode:

```bash
pnpm dev
```

Default local URLs:

| Service | URL |
|---|---|
| Web application | `http://localhost:3000` |
| REST API base | `http://localhost:5000/api/v1` |
| Swagger UI | `http://localhost:5000/api/docs` |
| OpenAPI JSON | `http://localhost:5000/api/docs-json` |

Run only the frontend:

```bash
pnpm --filter web dev
```

Run only the backend:

```bash
pnpm --filter server dev
```

Create production builds:

```bash
pnpm build
```

Start the built backend:

```bash
pnpm --filter server start:prod
```

Start the built frontend:

```bash
pnpm --filter web start
```

## API Documentation

The NestJS server generates interactive Swagger documentation automatically.

After starting the backend, open:

```text
http://localhost:5000/api/docs
```

All application endpoints use the following prefix:

```text
/api/v1
```

Major API groups include:

- Authentication
- User profiles
- Donors
- Blood requests
- Donor search and availability summaries
- Locations
- Donation information
- Notifications
- Announcements
- Administration and reports

The repository also includes a Bruno collection in `apps/server/bruno/` for manual API testing.

### Regenerate the OpenAPI File

```bash
pnpm --filter server openapi:generate
```

### Regenerate the Frontend API Client

Start the backend first, then run:

```bash
pnpm --filter web api:generate
```

The generator reads the OpenAPI specification and updates the client package under `packages/api-client`.

## Useful Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start all applications in development mode |
| `pnpm build` | Build the complete monorepo |
| `pnpm lint` | Run linting across workspaces |
| `pnpm typecheck` | Run TypeScript checks across workspaces |
| `pnpm format` | Run configured formatting tasks |
| `pnpm --filter server test` | Run backend unit tests |
| `pnpm --filter server test:e2e` | Run backend end-to-end tests |
| `pnpm --filter server test:cov` | Generate backend test coverage |
| `pnpm --filter server prisma:migrate` | Apply development database migrations |
| `pnpm --filter server prisma:studio` | Open Prisma Studio |
| `pnpm --filter web api:generate` | Regenerate the typed API client |

## Blood Request Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PendingReview
    PendingReview --> Published: Admin approves
    PendingReview --> Cancelled: Recipient cancels
    Published --> Matched: Donor accepts
    Published --> Expired: Deadline passes
    Published --> Unfulfilled: Closed without donor
    Matched --> InProgress: Donation arranged
    Matched --> Published: Match cancelled
    InProgress --> Fulfilled: Both parties confirm
    InProgress --> Cancelled: Request closed
    Fulfilled --> [*]
    Cancelled --> [*]
    Expired --> [*]
    Unfulfilled --> [*]
```

Key business rules implemented by the platform include:

1. New requests require administrative review before public publication.
2. Donor and recipient contact details are not publicly exposed.
3. Contact details become available only after a donor accepts a request.
4. Blood-group compatibility is considered during matching.
5. Completed donations require confirmation and update donor history.
6. Donor eligibility is controlled by a configurable cooldown period.

## Testing

Run backend unit tests:

```bash
pnpm --filter server test
```

Run tests in watch mode:

```bash
pnpm --filter server test:watch
```

Run test coverage:

```bash
pnpm --filter server test:cov
```

Run end-to-end tests:

```bash
pnpm --filter server test:e2e
```

Run repository-wide static checks:

```bash
pnpm lint
pnpm typecheck
```

## Security and Privacy

The project includes several security-oriented controls:

- JWT-based authentication
- Role-based access control for recipient, donor, and admin operations
- Request validation with unknown-field rejection
- API rate limiting
- Password hashing
- Session and authentication token records
- Audit logging for administrative actions
- Contact-information gating after donor acceptance
- Environment-based secrets

Before production deployment:

- Replace all example passwords and JWT secrets.
- Use HTTPS.
- Restrict CORS to trusted frontend origins.
- Use a managed PostgreSQL database with backups.
- Add SMS or email delivery for OTP workflows.
- Add production monitoring and structured logging.
- Review retention policies for personal and medical-adjacent data.
- Perform authorization, privacy, and abuse-prevention testing.
- Do not claim that listed donors or donated blood are medically screened.

## Project Documentation

Detailed design documents are available in the `docs/` directory:

- [`docs/01-core-features.md`](docs/01-core-features.md) — product scope and business rules
- [`docs/02-api-specification.md`](docs/02-api-specification.md) — REST API design
- [`docs/03-database-schema.md`](docs/03-database-schema.md) — database entities and relationships

Backend implementation notes and API test requests are available under `apps/server/`.

## Contributing

1. Create a feature branch.
2. Make focused changes.
3. Run linting, type checks, and relevant tests.
4. Update API documentation and generated clients when endpoints change.
5. Submit a pull request with a clear description and test evidence.

Suggested branch names:

```text
feature/donor-search
fix/request-status-transition
docs/setup-guide
```

