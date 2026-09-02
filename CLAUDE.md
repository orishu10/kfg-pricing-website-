# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Client (run from `client/`)
```
npm run dev       # Dev server on port 5173
npm run build     # tsc -b && vite build
npm run lint      # ESLint flat config
npm run preview   # Preview production build
npm test          # Vitest (single run); npm run test:watch for watch mode
```

Tests use Vitest and live next to the code as `*.test.ts`. The pricing
calculations in `pages/items/utils/helpers.ts` (`calcDerived`) are covered by
`helpers.test.ts` — keep these green when touching pricing logic. Run both
client and server concurrently during development — the Vite dev server proxies
`/api` to `localhost:3001`.

### Server (run from `server/`)
```
npm run dev          # ts-node-dev with hot reload on port 3001
npm run build        # tsc → dist/
npm run start        # node dist/index.js
npm run migrate      # apply pending DB migrations (after build)
npm run migrate:dev  # apply pending DB migrations from source (no build)
```

### Database
Migrations are applied by an idempotent runner (`server/src/migrate.ts`) that
tracks applied files in a `schema_migrations` table. It is safe to run
repeatedly and on every deploy — already-applied `.sql` files are skipped.
`schema.sql` runs first, then `migration_*.sql` in order.
```
cd server && npm run migrate:dev    # local dev
cd server && npm run build && npm run migrate    # production
```
Adding a migration: drop a new `db/migration_NNN_*.sql` file (defensive DDL —
`IF NOT EXISTS` / `CREATE OR REPLACE`) and run the migrate command.

Required `server/.env` (see `server/.env.example` for the full list):
```
PORT=3001
DB_HOST=localhost  DB_PORT=5432  DB_NAME=kfg_project
DB_USER=postgres   DB_PASSWORD=...  JWT_SECRET=...
# Production extras: DATABASE_URL (managed Postgres), CLIENT_ORIGIN (CORS), DB_SSL
```
`JWT_SECRET` is required — the server refuses to start without it.

## Architecture

### Full-Stack Overview
React 19 + Vite (port 5173) → Express + PostgreSQL (port 3001). Vite proxies `/api` to the server. The domain is KFG's pricing management tool: customers → suppliers → items, where items hold complex pricing fields (incoterm prices, cost build-up, tariffs, commissions).

### Client (`client/src/`)
- **Routing**: React Router v6, all routes defined in `App.tsx` using `React.lazy` + `Suspense`. Protected routes are wrapped in `AuthGuard` → `AppLayout`.
- **Auth**: `AuthContext` stores JWT + username in `localStorage` (`kfg_token`, `kfg_username`) and sets the Axios default `Authorization` header on load. `AuthGuard` redirects unauthenticated users to `/login`.
- **API layer**: Single Axios instance in `api/index.ts` with `baseURL: /api`. All server calls go through named functions here. Token is injected by `AuthContext`, not per-call.
- **Server state**: TanStack React Query (`queryClient.ts`): `staleTime: 30s`, `gcTime: 5min`, `retry: 1`, `refetchOnWindowFocus: false`. Cache is manually invalidated after mutations.
- **Pages** (lazy-loaded): `SignInPage`, `HomePage`, `CustomersPage`, `SuppliersPage` (`/customers/:customerId/suppliers`), `ItemsPage`, `ItemDetailPage` (`/items/:itemId`).
- **Styling**: MUI v6 with custom theme (`theme.ts`): primary `#c41230`, background `#c8c8c8`, no button text-transform.
- **Shared inputs** (`components/`): `CommonInput` renders a show/hide eye toggle for `type="password"` and delegates `type="date"` to `DateInput`. `DateInput` is a custom calendar popover over plain `YYYY-MM-DD` strings — use it for every date field instead of a native `type="date"` input.

### Server (`server/src/`)
- `index.ts`: Express app, CORS, `compression`, mounts routes under `/api`.
- `db.ts`: Single `pg.Pool` shared across all routes.
- Routes use parameterized `pool.query` calls only — no ORM. The `items.ts` route uses a local `n()` helper to safely convert empty strings to `null` for `NUMERIC` fields.
- Suppliers route wraps create + link in a DB transaction for atomicity.
- Auth: `POST /api/auth/login` → bcrypt verify → JWT (7-day expiry). `POST /api/auth/verify` validates existing tokens.

### Database schema (`db/schema.sql`)
Five tables: `users`, `customers`, `suppliers`, `customer_suppliers` (junction), `items`. Items holds ~25 NUMERIC(14,4) pricing columns spanning incoterm prices (`fob`, `cif`, `dap`, `ddp`), supplier pricing, cost build-up (`sub_total_1`, `us_tariff`, `sub_total_2`, `import_factor`, `kfg_commission`, `total`), and final cost/price/SAP fields. An `updated_at` trigger fires on item update.

### Pricing logic
Calculations (e.g. `supplier_price_case = supplier_price_unit × units_in_case`) are computed **on the client** inside `ItemDetailPage` before sending to the server. The server stores values as-is, enabling manual overrides. `pg` returns numeric DB columns as strings — the `Item` interface reflects this; `ItemPayload` uses `number | null` for what gets sent.

## TypeScript notes
- Client: `tsconfig.app.json` — ES2023, `react-jsx`, strict, `noUnusedLocals`, `erasableSyntaxOnly`.
- Server: `tsconfig.json` — ES2020, `commonjs`, strict, `erasableSyntaxOnly`.
- ESLint uses flat config (`eslint.config.js`) with TypeScript + React Hooks + React Refresh plugins.

## Code conventions
Apply these to every change; match the surrounding code when in doubt.
- **No comments.** Code should read on its own. Delete stale/explanatory comments rather than adding them.
- **Clear, full names.** No cryptic abbreviations for variables, functions, or components (`FormField`, not `Fld`). Names state intent.
- **Consts in `consts.ts`, helpers in `helpers.ts`.** Field-key lists, option arrays, empty-form objects, and static config live in a feature's `utils/consts.ts`; pure transform/derive/format functions live in `utils/helpers.ts`. Don't inline them in components.
- **Small, modular components.** Extract shared UI primitives instead of duplicating them (see `pages/logistics/components/form/`). Keep page components focused on layout + wiring.
- **Feature folder shape** (mirror `pages/logistics/routes`, `weeklyShipments`, `schedules`): `FeaturePage.tsx` (list/table), `hooks/useFeaturePage.tsx` (React Query + state), `components/FeatureFormPage.tsx` (full-page create/edit form), `utils/consts.ts`, `utils/helpers.ts`.
- **Data layer.** All server calls go through named functions in `client/src/api/index.ts`; components never call axios directly. Server routes stay parameterized `pool.query` (no ORM) and mirror the existing CRUD shape (`COLUMNS` list, `n()` empty→null helper).
- **DB changes** are additive migrations (`db/migration_NNN_*.sql`, defensive DDL) + the matching column in `schema.sql`; never edit an applied migration.
- **Before finishing**, keep it green: `cd client && npx tsc -b && npm run lint`, and `cd server && npx tsc --noEmit`.
