# SCAFFOLDING.md
> Generated: 2026-07-28
> Project: Valence
> Stack: pnpm monorepo — Next.js 15 (workbench/portal, Vercel) / Fastify + TS (api, Railway) /
> Python (analysis + review workers, Railway) / Postgres + Redis (Railway) / plain SQL
> migrations via dbmate
> Current state: Phase 0 skeleton complete and verified — compose stack, migrations, CI, and
> a real (not stubbed) health path across api and workbench are working end to end.

---

## Project Summary

Valence is a Web3 security firm's internal tooling for pre-audits — the readiness review a
protocol runs before (or instead of) a paid security audit. The product is a triage workbench
that lets one auditor run a battery of analysis tools against a client's Solidity repo, dedupe
and suppress the noise, review LLM-proposed findings against a hard evidence gate (a proposal
only counts if a generated Foundry test actually fails against the repo), and produce a
defensible readiness report: triaged findings, a blocker list, an invariant inventory,
coverage gaps, and scope statistics. Full spec lives in [`CLAUDE.md`](../CLAUDE.md).

**Inferred intent:** Build the internal auditor workbench first — the software should shorten
the time from repo intake to a defensible report, not chase self-serve features prematurely.
**Confidence:** High — `CLAUDE.md` is an explicit, detailed spec written by the project owner,
not inferred from code.

---

## What Already Exists

| Area | Status | Notes |
|---|---|---|
| Monorepo structure | ✅ Done | pnpm workspaces (`apps/*`, `packages/*`, `workers/*`); only `apps/api` and `apps/workbench` populated so far |
| Dependencies | ✅ Done | `pnpm install` resolves cleanly across the workspace |
| Local compose stack | ✅ Done | Postgres 16 + Redis 7 via `infra/docker-compose.yml`, both with real healthchecks |
| Migrations | ✅ Done | `dbmate`, one bootstrap migration (`pgcrypto` extension) — no product tables yet, by design |
| `apps/api` health path | ✅ Done | `GET /health` checks live Postgres + Redis connectivity, not just process liveness |
| `apps/workbench` | 🔧 Partial | One page that server-fetches `apps/api`'s `/health` and renders it — proves the split works, no product UI yet |
| CI | ✅ Done | GitHub Actions: install, typecheck, build, migrate, test, smoke-test `/health` — written and passing locally against the same steps, not yet run against a pushed GitHub repo |
| Tests | 🔧 Partial | One integration test (`apps/api/src/health.test.ts`) against a real DB/Redis; no test infra yet for Python workers (don't exist yet) |
| Git repository | ❌ Missing | Directory is not yet a git repo — nothing committed |
| `apps/portal` | ❌ Missing | Phase 5 |
| `apps/api` product routes | ❌ Missing | Auth, orgs, engagements, findings, runs, SSE log streaming — Phase 1+ |
| `packages/findings`, `packages/report`, `packages/sdk`, `packages/cli` | ❌ Missing | Phase 1 (`cli`), Phase 2 (`findings`), Phase 4 (`report`) |
| `workers/orchestrator`, `workers/analysis`, `workers/review` | ❌ Missing | Phase 1, Phase 2, Phase 7 respectively |
| Sandboxed build execution | ❌ Missing | Phase 1 — security boundary for untrusted client repos, strategy not yet decided |
| `corpus/` | ❌ Missing | Phase 7 |
| Deployment config (Vercel/Railway) | ❌ Missing | Hosting split decided (see `CLAUDE.md`) but no actual Vercel/Railway project wired up yet |

---

## Build Phases

## Phase 0: Skeleton — Done

**Goal:** Monorepo, compose with Postgres and Redis, migrations, CI, health endpoints.
**Depends on:** Nothing — starting point.
**Estimated scope:** Small — closed out 2026-07-28.

### Checklist

- [x] Scaffold pnpm workspace (`pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`)
- [x] Build `apps/api` (Fastify) with `GET /health` checking real Postgres + Redis connectivity
- [x] Build `apps/workbench` (Next.js 15) with a page that server-fetches `apps/api`'s `/health`
- [x] Write `infra/docker-compose.yml` (Postgres 16, Redis 7, `dbmate` migrate step, `api`)
- [x] Write first `dbmate` migration (`infra/migrations/20260728120000_init.sql`)
- [x] Write `.github/workflows/ci.yml` (install → migrate → typecheck → build → test → smoke-test `/health`)
- [x] Write `Makefile` with `make demo` (compose up, migrate, build+start api, poll `/health`)
- [x] Write `apps/api/src/health.test.ts` as an integration test against real Postgres/Redis
- [x] Run `pnpm install`, `pnpm -r typecheck`, `pnpm -r build` clean
- [x] Run `make demo` and confirm `{"status":"ok","checks":{"postgres":"ok","redis":"ok"}}`
- [x] Run `apps/api` test suite against the live compose stack — passing
- [x] Boot `apps/workbench` in dev mode and confirm it actually reaches `apps/api` at runtime

---

## Phase 1: Intake and Sandbox — Next

**Goal:** Engagement model, repo clone at pinned commit, sandboxed build across a solc matrix,
streamed logs, artifact persistence.
**Depends on:** Phase 0 complete.
**Estimated scope:** Large — this phase includes the project's core security boundary.

### Checklist

- [ ] Design and migrate the `engagements` table (repo URL, pinned commit, scope globs, docs
      links, deadline) via a new `infra/migrations/*.sql` file
- [ ] Add Kysely type definitions for `engagements` in `apps/api`
- [ ] Build engagement intake: API route to create an engagement record
- [ ] Stand up `workers/orchestrator` (TS) as a BullMQ queue consumer skeleton
- [ ] Implement pinned-commit clone into an isolated workspace (tmpfs, read-only root)
- [ ] Resolve the solc build matrix and run `forge build` per version, checked against the
      chosen sandbox strategy (see decision below)
- [ ] Enforce no network egress after dependency fetch, memory/CPU caps, hard wall-clock kill
- [ ] Add a determinism check: build twice, diff artifacts
- [ ] Stream build logs from the sandbox back through SSE on `apps/api`
- [ ] Persist build artifacts to object storage (Cloudflare R2)
- [ ] Add `NOT_IMPLEMENTED` responses (never a fabricated pass) for any sub-step not yet built
- [ ] Write a test that clones a real public Foundry repo end to end and asserts a reproducible
      build plus a stored artifact set (this is the phase's acceptance test — automate it)
- [ ] Update `docs/BUILD_PLAN.md` status table and this file when the acceptance test passes

> **Decision required:** Sandbox strategy — Docker vs. gVisor vs. Firecracker. This is the
> security boundary for arbitrary, untrusted client repos and is expensive to reverse once
> `workers/orchestrator` is built against one model. Per the working agreement, this needs
> options-with-tradeoffs presented before any sandbox code is written — do not default to
> plain Docker containers without raising this first.

> **Decision required:** Whether the first paying engagements are run entirely by hand while
> this phase is being built. Doesn't block the code, but changes how urgently Phase 1 needs to
> ship and whether partial/manual workarounds are acceptable in the interim.

> **External setup:** Cloudflare R2 bucket + credentials for artifact storage. Railway project
> for `workers/orchestrator` once it needs to run outside local compose.

---

## Open Questions

These affect phases beyond Phase 1 and don't need to be resolved yet, but are tracked so they
don't get decided by default inertia. Full list with phase mapping in
[`docs/BUILD_PLAN.md`](./BUILD_PLAN.md#pending-decisions-blocking-future-phases): severity
model (Phase 2), hosted-LLM provider terms (Phase 7), whether Valence sells to audit firms as
a tooling layer (Phase 4 report design).

---

## Out of Scope (this cycle)

Visible in `CLAUDE.md`'s architecture but explicitly not part of Phase 1:

- `packages/findings`, `packages/report`, `packages/sdk` — Phase 2 and Phase 4
- `apps/portal`, remediation loop — Phase 5
- Invariant inventory, Medusa/Echidna/halmos integration — Phase 6
- LLM review pipeline and corpus — Phase 7
- GitHub App / continuous mode — Phase 8
- Multi-tenant orgs, billing, RBAC — Phase 9
