# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

Nothing yet — Phase 1 (intake and sandbox) is next. See
[`docs/BUILD_PLAN.md`](./docs/BUILD_PLAN.md) for status and
[`docs/SCAFFOLDING.md`](./docs/SCAFFOLDING.md) for the current task checklist.

## [0.0.1] - 2026-07-28

### Added

- Phase 0 skeleton: pnpm monorepo (`apps/api`, `apps/workbench`).
- `apps/api` (Fastify): `GET /health`, checking real Postgres and Redis connectivity, not
  process liveness.
- `apps/workbench` (Next.js 15): status page that server-fetches `apps/api`'s `/health` at
  request time, proving the two apps actually talk to each other over the network.
- `infra/docker-compose.yml`: Postgres 16, Redis 7, `dbmate` migration step, `api`.
- First migration (`infra/migrations/20260728120000_init.sql`) enabling `pgcrypto`.
- `.github/workflows/ci.yml`: install, migrate, typecheck, build, test, smoke-test `/health`.
- `Makefile` with `make demo` — brings up the stack, migrates, builds and starts the api,
  polls `/health` until healthy or fails loudly.
- Integration test (`apps/api/src/health.test.ts`) against a live Postgres/Redis, not mocks.
- `CLAUDE.md`, `docs/BUILD_PLAN.md`, `docs/SCAFFOLDING.md` — project reference and phase
  tracking docs.

### Decided

- Hosting split: `apps/workbench` / `apps/portal` on Vercel; `apps/api`, `workers/*`,
  Postgres, Redis on Railway, private network. Artifact storage on Cloudflare R2.
- Postgres access layer: plain SQL migrations as schema source of truth, Kysely (TS) and
  SQLAlchemy Core/psycopg (Python) as query layers — no ORM owns the schema.

Full reasoning for both in [`CLAUDE.md`](./CLAUDE.md#decisions-made-do-not-re-litigate-without-cause).
