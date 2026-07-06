# RaktoSetu API Tester (`apps/api-tester`)

A **temporary, throwaway** frontend for exercising every RaktoSetu backend
endpoint by hand — inspecting requests/responses, driving the auth flow, and
validating integration. It is deliberately independent of the real SPA
(`apps/client`) so it can be redesigned or deleted without touching product
code.

## What it does

- Data-driven catalog of **all 63 API endpoints** (`src/lib/endpoints.ts`) — the
  entire UI is generated from that one file. Add/edit an endpoint there; no new
  components needed.
- For each endpoint: fill **path params**, **query params**, and an editable
  **JSON body** (pre-filled from the server DTO examples), then send.
- **Loading / success / error** states handled uniformly, with the raw HTTP
  status, timing, and a syntax-highlighted JSON response viewer.
- **Auth**: the Login endpoint captures the JWT automatically and stores it in
  `localStorage`; it's then attached as `Authorization: Bearer …` to every
  request. Logout / Clear removes it. You can also paste a token manually.
- Every request is also `console.info`/`console.warn`-logged for debugging.

## Architecture

```
src/
  lib/
    endpoints.ts   # the endpoint catalog (source of truth)
    http.ts        # fetch wrapper: URL building, auth header, result shape
    auth.ts        # token storage + subscription
  hooks/
    useApiRequest.ts  # loading/success/error lifecycle for one call
  components/
    Sidebar.tsx        # filterable endpoint navigation
    EndpointRunner.tsx # request form + response panel
    JsonViewer.tsx     # pretty JSON output
    AuthBar.tsx        # auth state / manual token entry
  App.tsx / main.tsx / styles.css
```

Business logic (transport, auth, endpoint definitions) is fully separated from
the presentation, so the UI can be swapped later without touching it.

## Configure the backend URL

Copy the example env file and adjust:

```bash
cp .env.example .env
```

- **Local dev (recommended):** leave `VITE_API_URL` empty. The app calls
  same-origin `/api/v1/...` and the Vite dev server proxies `/api` to
  `PROXY_TARGET` (default `http://localhost:5000`). No CORS setup needed.
- **Remote API:** set `VITE_API_URL=https://your-api-host` (no trailing slash);
  requests go straight there. The server already reflects the request origin for
  CORS in dev.

## Run

From the repo root (installs workspace deps):

```bash
pnpm install
```

Then, with the API running (`pnpm --filter server dev`):

```bash
pnpm --filter api-tester dev        # http://localhost:5174
```

Other scripts: `pnpm --filter api-tester build`,
`pnpm --filter api-tester typecheck`.
