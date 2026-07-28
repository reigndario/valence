# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `apps/marketing` — a single public landing page, deploys to its own Vercel project. Jumped
  the queue ahead of Phase 1 to get a live public surface up sooner; doesn't block or get
  blocked by the numbered phase plan.
- Phase 1 (intake and sandbox): the `engagements` table and intake API (`POST`/`GET
  /engagements` on `apps/api`, enqueuing a BullMQ build job), SSE log streaming (`GET
  /engagements/:id/logs`), and `workers/orchestrator` — a BullMQ consumer wrapping the real
  sandbox pipeline. The pipeline clones a repo at a pinned commit, resolves the solc build
  matrix from the repo's own Foundry build cache, runs two independent hardened Docker builds
  (read-only rootfs, dropped capabilities, an explicit vendored seccomp profile,
  no-new-privileges, network cut after dependency fetch, memory/CPU caps, a hard wall-clock
  kill) for a determinism check, and persists artifacts to a Docker named volume — the
  local-dev stand-in for the Railway Volume `workers/orchestrator` uses in production.
  Non-Foundry repos get an explicit `not_implemented` status rather than a fabricated pass.
  Acceptance test and `make demo` both exercise the real pipeline end to end against a real
  public repo (`foundry-rs/forge-template`), no mocks.

### Changed

- Product direction: `CLAUDE.md` now prioritizes Warden (formal verification), Scout (an AI
  agent that infers intent and writes verification rules for it), and Foil (mutation testing)
  as the automated engine layer inside the existing `apps/workbench` architecture — no
  app/package rename, same three-product shape as Certora's Prover/AutoProver/Gambit lineup.
  The phase plan is restructured and renumbered (2-9 → 2-11): a new Phase 2 ("marketing funnel
  UI v1") is pulled ahead of the analysis battery, since the UI now doubles as a shareable,
  permanent-report-URL funnel for non-confidential runs, not just an internal tool. Warden
  lands at Phase 5, Scout at Phase 6 (absorbing the former standalone "LLM review pipeline"),
  Foil at Phase 7. `docs/SCAFFOLDING.md` bumped to schema v3.0.0 with the full renumbered
  checklists and an item-ID remapping table; `docs/BUILD_PLAN.md` updated to match.
- Phase-checklist scaffolding policy: `CLAUDE.md`'s working agreement now calls for full
  task-level checklists across all phases (0-9) up front, drafted in
  [`docs/SCAFFOLDING.md`](./docs/SCAFFOLDING.md) (bumped to its own schema v2.0.0, with a
  revision history, a semver policy, stable `P{phase}-{seq}` item IDs, and a status legend),
  superseding the prior "no speculative scaffolding for later phases" rule for planning
  purposes. Execution itself is still strictly one phase at a time.
- Artifact storage: **Railway Volume** (plain block storage), superseding the Cloudflare R2
  decision from Phase 0 the same day. Driven by a new standing constraint: infra is Railway +
  Vercel + Docker Desktop locally, nothing else — no AWS, no Cloudflare, fewer dependencies
  preferred when a choice is close. Tradeoff: no presigned-URL downloads; Phase 5's client
  portal will proxy file downloads through `apps/api` instead.

Full reasoning for both in
[`CLAUDE.md`](./CLAUDE.md#decisions-made-do-not-re-litigate-without-cause). Phase 2 (analysis
battery v1) is next on the numbered plan — see [`docs/BUILD_PLAN.md`](./docs/BUILD_PLAN.md)
for status and [`docs/SCAFFOLDING.md`](./docs/SCAFFOLDING.md) for the current task checklist.

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
