# AgileFlow

Agile project management SPA built with Next.js 16 (static export), Zustand, React Query, and MSW mocks.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo accounts**

| Email | Password | Role |
|-------|----------|------|
| admin@agileflow.com | admin123 | Admin / Scrum Master |
| dev@agileflow.com | dev123 | Developer |

## Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_USE_MSW=true
NEXT_PUBLIC_STANDUP_END_HOUR=10
```

Production builds (see `.env.production`) also set:

```env
NEXT_PUBLIC_BASE_PATH=/SES/PM
```

API base defaults to `/api` in`dev` and `/SES/PM/api` in production (under the same `basePath` so MSW can intercept). Override with `NEXT_PUBLIC_API_URL` if needed.

- `NEXT_PUBLIC_USE_MSW=true` — intercept API calls with MSW (development/demo)
- `NEXT_PUBLIC_USE_MSW=false` — call the Java/Tomcat REST API at `NEXT_PUBLIC_API_URL`

## Build & deploy

```bash
npm run build
```

Output is written to `out/`. Serve the folder as static files (Tomcat, nginx, CDN).

### Tomcat

1. Copy contents of `out/` so they are served at **`/SES/PM/`** (matches `basePath`), e.g. `webapps/SES/PM/` depending on your layout.
2. Ensure `mockServiceWorker.js` is reachable at `/SES/PM/mockServiceWorker.js`.
3. Prefer HTTPS (or localhost). Service workers do not run on plain HTTP LAN IPs.
4. For client-side routes, configure a 404 fallback to `index.html` if your server requires it for unknown paths.

## API contract

Shared TypeScript DTOs for the Java backend live in [`lib/api/types.ts`](lib/api/types.ts).

## Features

- JWT auth (client-side) with Admin/Scrum Master and Developer roles
- Dashboard, projects, team, multi-sprint planning
- Kanban board with drag-and-drop (`@dnd-kit`)
- Daily standup with morning window gate on the board
- Burndown, velocity, and standup reports
