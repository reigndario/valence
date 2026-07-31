# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Phase 2 (marketing funnel UI v1), first slice: a shared-secret middleware auth gate in
  `apps/workbench` (P2-08) that protects every route except an explicit `/trial` +
  `/report/[id]` allowlist; the engagement list view (`/`); and an engagement detail view with
  run history and a live SSE-fed log viewer (P2-01, P2-02). Getting there required closing a
  gap Phase 1 left open — `workers/orchestrator`'s pipeline computed a result per run but never
  persisted it anywhere queryable — so this also adds a `runs` Postgres table, `apps/api`
  routes `GET /engagements` and `GET /engagements/:id/runs`, and
  `workers/orchestrator/src/persist-run.ts` to write each run's result once the pipeline
  completes. Verified against live dev servers, not just typechecked: the auth redirect, the
  public allowlist, the login cookie flow, and a Redis `PUBLISH` reaching the browser as a
  parsed log line end to end.
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

- Renamed the spec language from **WSL** to **Fletch** (`packages/wsl` → `packages/fletch`,
  `.wsl` → `.fletch`) across `CLAUDE.md`, `docs/SCAFFOLDING.md`, `docs/BUILD_PLAN.md`, and
  `apps/marketing/content/home.ts`'s illustrative rule panel. WSL collided with "Windows
  Subsystem for Linux." No functional or scope change. Separately, corrected a stale phase-order
  decision in `docs/BUILD_PLAN.md`: Phase 5 (Artemis) is next after Phase 2, not Phase 7 (Foil)
  — Foil depends on Artemis's rule suite existing, so it was never actually buildable first.
- Renamed the Warden product to **Artemis** across `apps/marketing`, `apps/workbench`,
  `CLAUDE.md`, and `docs/`. Naming change only — no functional or scope change. Earlier entries
  in this changelog referring to "Warden" describe the product under its former name and are
  left as written.
- `apps/marketing` rebuilt from a single static landing page into a full multi-page site: a
  keyboard-operable header with mega-menu dropdowns (Products, Security Services, Community,
  Company) and a mobile hamburger/accordion overlay, a footer mirroring the nav, and stub pages
  for every nav route (Warden/Scout/Foil, Audits/Enterprise/Pricing, Blog, About, Docs, Contact,
  Terms, Privacy). Home page now runs hero → tooling strip (Foundry/Slither/Halmos/Z3, no
  invented client logos) → a two-pane code/rule panel (a real compiling `transferFrom` beside
  illustrative Fletch, no live status badge since nothing actually ran) → three feature callouts →
  two comparison cards. Palette replaced with Valence's warm pastel scheme
  (`apps/marketing/app/globals.css`); all copy moved into typed objects under
  `apps/marketing/content/`. Adds a package-scoped `vitest` + `@testing-library/react` setup
  with keyboard/accordion tests for the nav.
- `CLAUDE.md` condensed from the full project brief into a short pointer file; the business
  context, architecture, and phase-by-phase build plan it used to carry now live solely in
  `docs/SCAFFOLDING.md`.
- Two Phase 2 decisions resolved per the working agreement's "raise before committing" rule:
  workbench auth is a Next.js middleware shared-secret cookie (chosen over Vercel Standard
  Protection, which is deployment-wide and can't leave `/trial`/`/report/[id]` public while
  gating everything else), and no run is public by default — every run starts private, sharing
  requires an explicit, logged per-run action. Recorded in `CLAUDE.md`'s "Decisions made"
  section and `docs/SCAFFOLDING.md`'s v3.1.0 revision-history entry.
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
