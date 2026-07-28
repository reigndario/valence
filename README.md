# Valence

Internal auditor workbench and pre-audit pipeline. See [CLAUDE.md](./CLAUDE.md) for the full
project reference — what a pre-audit delivers, hard constraints, architecture, and the phase
plan. This README covers running Phase 0 and Phase 1 locally.

## Phase 1: intake and sandbox

What's new: an `engagements` table and intake API (`POST`/`GET /engagements`), SSE log
streaming (`GET /engagements/:id/logs`), and `workers/orchestrator` — a BullMQ consumer that
runs the actual sandbox pipeline: pinned-commit clone, a solc build matrix resolved from the
repo itself, two independent hardened Docker builds (read-only rootfs, dropped capabilities,
seccomp, no-new-privileges, no network after dependency fetch, memory/CPU caps, a hard
wall-clock kill) for a determinism check, and artifact persistence to a Docker named volume
(the local stand-in for the Railway Volume `workers/orchestrator` uses in production).

### Additional prerequisite

Docker must be able to pull `ghcr.io/foundry-rs/foundry:latest` and run containers with
`--read-only`, `--tmpfs`, `--cap-drop`, and a custom `--security-opt seccomp=...` profile —
Docker Desktop supports all of this out of the box, no extra setup needed.

### Try it

```bash
pnpm --filter @valence/orchestrator demo
```

Clones a real public Foundry repo at a pinned commit, runs the hardened build sandbox twice,
and prints the determinism result plus where the artifacts landed. This is the same pipeline
`POST /engagements` enqueues a job for for once `workers/orchestrator` is running
(`pnpm --filter @valence/orchestrator dev`).

### Tests

```bash
make test
```

Runs `apps/api`'s suite (health, engagement intake + job enqueue, SSE log streaming against a
real Redis publish) and `workers/orchestrator`'s suite — including the phase's acceptance
test: a real clone, a real hardened build (twice), and a real determinism check against
`foundry-rs/forge-template`. No mocks; requires Docker and network egress.

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
