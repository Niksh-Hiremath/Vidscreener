## Vidscreener

Vidscreener is a Next.js frontend with a Cloudflare Worker API backend using D1 (SQLite) via Drizzle.

## Stack
- `app/`: Next.js App Router UI
- `wrangler/`: Cloudflare Worker API
- `db/`: Drizzle schema + DB access helpers
- `drizzle/`: SQL migrations

## Environment Variables
- `JWT_SECRET`: JWT signing secret used by the Worker.
- `WORKER_API_BASE_URL`: base URL used by server-side Next code (default `http://localhost:8787`).
- `NEXT_PUBLIC_WORKER_API_BASE_URL`: base URL used by browser-side Next code (default `http://localhost:8787`).
- `ALLOWED_ORIGINS`: optional comma-separated CORS allowlist for Worker (example: `http://localhost:3000,https://your-domain.com`).

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run Next.js frontend:
```bash
npm run dev
```

3. Run Worker API:
```bash
npx wrangler dev
```

Frontend default URL: `http://localhost:3000`
Worker default URL: `http://localhost:8787`

## Auth + API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/profile`
- `POST /api/organization/create`
- `GET /api/organization/admins`
- `POST /api/organization/admins/add` (superadmin only)
- `POST /api/organization/admins/remove` (superadmin only)
- `POST /api/organization/rename` (superadmin only)
- `POST /api/organization/superadmin/transfer` (superadmin only)
- `POST /api/organization/exit` (admin; superadmin must transfer first)

JWT is issued by Worker and stored in an HttpOnly `token` cookie.

## Database

- Generate migrations with Drizzle based on `db/schema.ts`.
- Apply migrations to D1 using Wrangler/Drizzle workflow.

Seed roles (`admin`, `reviewer`, `submitter`) using `seed-roles.ts` in your deployment/bootstrapping flow.
