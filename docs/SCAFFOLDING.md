# SCAFFOLDING.md
> Generated: 2026-07-28
> Project: Valence
> Stack: pnpm monorepo — Next.js 15 (workbench/portal/marketing, Vercel) / Fastify + TS
> (api, Railway) / Python (analysis + review workers, Railway) / Postgres + Redis (Railway) /
> plain SQL migrations via dbmate / Railway Volume for artifact storage. Infra footprint is
> deliberately just Railway + Vercel + Docker Desktop locally — no AWS, no Cloudflare.
> Current state: Phase 0 skeleton and Phase 1 (intake and sandbox) complete and verified.
> `apps/marketing` (public landing page, jumped the queue ahead of Phase 1) built and
> verified, not yet deployed.

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
| Migrations | ✅ Done | `dbmate`; bootstrap migration (`pgcrypto`) plus Phase 1's `engagements` table |
| `apps/api` health path | ✅ Done | `GET /health` checks live Postgres + Redis connectivity, not just process liveness |
| `apps/workbench` | 🔧 Partial | One page that server-fetches `apps/api`'s `/health` and renders it — proves the split works, no product UI yet |
| CI | ✅ Done | GitHub Actions; now also runs `workers/orchestrator`'s Docker-backed sandbox test |
| Lint | ❌ Missing | `eslint`/`next lint` were never wired up in Phase 0; both scripts now fail loudly and honestly rather than silently no-op |
| Tests | ✅ Done | `apps/api`: health, engagement intake, SSE log streaming (all against a real DB/Redis). `workers/orchestrator`: hardened-container wall-clock kill, and the Phase 1 acceptance test (real clone + hardened build + determinism check against a real public repo). No test infra yet for Python workers (don't exist yet) |
| Git repository | ✅ Done | `github.com/reigndario/valence`, Phase 0 merged to `main` via PR #1, sandbox-strategy decision doc merged via PR #2 |
| Vercel deployment | 🔧 Partial | `apps/workbench` project created; Deployment Protection currently disabled per Jeff's call (see `CLAUDE.md` note) |
| `apps/marketing` | ✅ Done | Single public landing page, builds and typechecks clean, not yet deployed to its own Vercel project |
| `apps/portal` | ❌ Missing | Phase 5 |
| `apps/api` product routes | 🔧 Partial | Engagement intake (`POST`/`GET /engagements`) and SSE log streaming (`GET /engagements/:id/logs`) done; auth, orgs, findings, runs still to come |
| `packages/findings`, `packages/report`, `packages/sdk`, `packages/cli` | ❌ Missing | Phase 2 (`findings`), Phase 4 (`report`); `sdk`/`cli` not yet scheduled to a specific phase |
| `workers/orchestrator` | ✅ Done | BullMQ consumer + the full Phase 1 sandbox pipeline (clone, hardened build, determinism check, artifact persistence) |
| `workers/analysis`, `workers/review` | ❌ Missing | Phase 2, Phase 7 respectively |
| Sandboxed build execution | ✅ Done | Hardened Docker (runc): read-only rootfs, tmpfs workspace, dropped caps, seccomp, no-new-privileges, network cut after dependency fetch, memory/CPU caps, wall-clock kill — see Phase 1 below |
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

## Phase 1: Intake and Sandbox — Done

**Goal:** Engagement model, repo clone at pinned commit, sandboxed build across a solc matrix,
streamed logs, artifact persistence.
**Depends on:** Phase 0 complete.
**Estimated scope:** Large — this phase includes the project's core security boundary.
**Closed out:** 2026-07-28.

### Checklist

- [x] Design and migrate the `engagements` table (repo URL, pinned commit, scope globs, docs
      links, deadline) via a new `infra/migrations/*.sql` file
- [x] Add Kysely type definitions for `engagements` in `apps/api`
- [x] Build engagement intake: API route to create an engagement record
- [x] Stand up `workers/orchestrator` (TS) as a BullMQ queue consumer skeleton
- [x] Implement pinned-commit clone into an isolated workspace (tmpfs, read-only root)
- [x] Resolve the solc build matrix and run `forge build` per version, inside a hardened
      Docker container (runc) — see decision below
- [x] Harden the build container: read-only rootfs, tmpfs workspace, dropped capabilities,
      seccomp profile, `no-new-privileges`
- [x] Enforce no network egress after dependency fetch, memory/CPU caps, hard wall-clock kill
- [x] Add a determinism check: build twice, diff artifacts
- [x] Stream build logs from the sandbox back through SSE on `apps/api`
- [x] Persist build artifacts to a Railway Volume attached to `workers/orchestrator`
- [x] Add `NOT_IMPLEMENTED` responses (never a fabricated pass) for any sub-step not yet built
- [x] Write a test that clones a real public Foundry repo end to end and asserts a reproducible
      build plus a stored artifact set (this is the phase's acceptance test — automate it)
- [x] Update `docs/BUILD_PLAN.md` status table and this file when the acceptance test passes

> **Decided (2026-07-28):** Sandbox strategy is hardened Docker (runc), not gVisor or
> Firecracker, for Phase 1 — ships on Railway with no new infrastructure. Explicit tradeoff:
> revisit (gVisor first) before the first paying engagement runs an adversarial repo through
> it. Full reasoning in `CLAUDE.md`.

> **Decision required (still open — raise with Jeff):** Whether the first paying engagements
> are run entirely by hand while the workbench is built. Didn't block Phase 1's code, but
> still changes how urgently later phases (triage UI, report generation) need to ship and
> whether manual workarounds are acceptable until they do.

> **Decided (2026-07-28):** Artifact storage is a Railway Volume (plain block storage), not an
> object-storage vendor — the infra footprint is Railway + Vercel + Docker Desktop locally,
> nothing else. Tradeoff: no presigned-URL downloads; Phase 5's client portal will proxy file
> downloads through `apps/api` instead of handing out direct links. **Implemented (local dev)
> as a Docker named volume (`valence-artifacts`)** mounted into the hardened build containers
> — the faithful local stand-in for a Railway Volume attached to `workers/orchestrator`, and
> deliberately not a host bind-mount: Solidity build output legitimately contains
> case-colliding sibling paths (`out/Test.sol` vs `out/test.sol`), which breaks on a
> case-insensitive host filesystem (macOS/Docker Desktop) but not on the named volume's real
> Linux filesystem.

> **External setup:** Railway project + attached Volume for `workers/orchestrator` once it
> needs to run outside local compose.

**Implementation notes:**
- Dependency fetch (git clone, submodule init, solc auto-install) is a host process with
  network — not sandboxed inside the hardened container — because the security boundary this
  phase cares about is *executing* the repo's build tooling (forge/solc), not fetching known
  source over HTTPS at a pinned commit. Git hooks are disabled (`core.hooksPath=/dev/null`)
  as defense in depth regardless. Solc install itself *does* run inside a hardened container
  (read-only rootfs, dropped caps, no-new-privileges, seccomp) with network on; the two
  determinism-check builds that follow run the same hardening with `--network none`.
- The solc build matrix is resolved from Foundry's own `cache/solidity-files-cache.json`
  after the dependency-fetch build, rather than guessed at from `foundry.toml` or source
  pragmas — it's exactly what Foundry decided it needed, not our guess.
- Acceptance test and `make demo` both run the real pipeline against
  `foundry-rs/forge-template` at a pinned commit — real clone, real hardened Docker build (run
  twice), real determinism check, real Docker-volume artifact persistence. No mocks.
- `make test` now also runs `workers/orchestrator`'s suite, including a dedicated wall-clock
  kill test and an SSE log-streaming test (publish on Redis, assert it arrives over SSE).
  CI runs the same via a new `Run orchestrator sandbox test` step (needs Docker + network,
  both available on GitHub-hosted runners).

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
