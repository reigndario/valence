# Valence

Internal auditor workbench and pre-audit pipeline. See [CLAUDE.md](./CLAUDE.md) for the full
project reference — what a pre-audit delivers, hard constraints, architecture, and the phase
plan. This README only covers running Phase 0 locally.

## Phase 0: skeleton

What exists so far: the monorepo shell, a Postgres + Redis compose stack, a `dbmate` migration,
CI, and `apps/api` / `apps/workbench` wired together through a real health check (not a stub —
`/health` actually queries Postgres and pings Redis).

### Prerequisites

- Node 22+, [pnpm](https://pnpm.io) (via corepack), Docker Desktop

### Quickstart

```bash
cp .env.example .env
pnpm install
make demo
```

`make demo` brings up Postgres and Redis, runs the pending migrations, builds and starts
`apps/api`, then polls `/health` until it reports `ok` (or fails loudly if it doesn't).

To run the workbench against it:

```bash
pnpm --filter @valence/workbench dev
```

then open `http://localhost:3000` — it calls `apps/api`'s `/health` server-side and renders
the live result.

### Tests

```bash
make up        # postgres + redis only
pnpm --filter @valence/api test
```

The API test suite is integration-style on purpose: it asserts against a real Postgres and
Redis, not mocks, because a health check that doesn't actually check anything is worse than no
health check.
