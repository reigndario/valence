# SCAFFOLDING.md
> Generated: 2026-07-28
> Doc schema version: **3.1.1** — see [Revision History](#revision-history) and
> [Versioning Standard](#versioning-standard) below.
> Project: Valence
> Stack: pnpm monorepo — Next.js 15 (workbench/portal/marketing, Vercel) / Fastify + TS
> (api, Railway) / Python (analysis + engines + review workers, Railway) / Postgres + Redis
> (Railway) / plain SQL migrations via dbmate / Railway Volume for artifact storage. Infra
> footprint is deliberately just Railway + Vercel + Docker Desktop locally — no AWS, no
> Cloudflare, including for Artemis/Scout/Foil artifacts (counterexamples, traces, mutation
> output, WSL corpora all land on the same Railway Volume).
> Current state: Phase 0 skeleton and Phase 1 (intake and sandbox) complete and verified.
> `apps/marketing` (public landing page, jumped the queue ahead of Phase 1) built and
> verified, not yet deployed. Phase 2 (marketing funnel UI v1) is in progress — P2-08 and
> P2-12's blocking decisions are resolved (see Revision History), unblocking the rest of the
> phase.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-28 | Initial scaffold. Task-level checklists for Phase 0 and Phase 1 only; Phases 2–9 listed as one-line "Out of Scope" pointers to `CLAUDE.md`, per the then-standing "no speculative scaffolding for later phases" rule. |
| 2.0.0 | 2026-07-28 | **Schema change.** `CLAUDE.md`'s working agreement amended: full task-level checklists now drafted for all phases (0–9) up front, so the whole roadmap is visible and versioned from day one. Added the item-ID scheme and status legend below for enterprise-style cross-referencing (commits/PRs can cite `P4-07`, etc.). Execution discipline is unchanged — one phase worked at a time, later checklists revised as their turn comes. |
| 3.0.0 | 2026-07-28 | **Structural change**, mirroring `CLAUDE.md`'s product-direction update. Artemis (formal verification), Scout (an AI agent), and Foil (mutation testing) are added as priority phases alongside the existing pre-audit business, inside the existing architecture — no app/package rename. A new **"marketing funnel UI v1"** phase is inserted as **Phase 2** (workbench shell, the full triage-queue interaction set, the self-serve trial flow, and a permanent shareable public report URL), pulling UI ahead of further backend depth on purpose. Phases 2–9 are renumbered to 2–11 to make room; old Phase 7 (LLM review pipeline) is absorbed into new Phase 6 (Scout) — same evidence-gate design, wider job, not a separate track. **Item-ID remapping:** old `P2-*` (analysis battery) → new `P3-*`; old `P3-*` (triage workbench) → folded into new `P2-*`; old `P4-*` (report generation) → unchanged, still `P4-*`; old `P5-*` (client portal) → new `P8-*`; old `P6-*` (property testing) → new `P9-*`; old `P7-*` (LLM review) → folded into new `P6-*` (Scout); old `P8-*` (CI) → new `P10-*`; old `P9-*` (commercial) → new `P11-*`. This remapping is safe under the ID-stability rule below because none of the reassigned items had been started, checked off, or cited in a merged PR — only `P0-*`/`P1-*` carry real history, and those are untouched. |
| 3.1.0 | 2026-07-29 | **Phase 2 status change** (Next → In Progress) plus resolution of both items' blocking decisions. **P2-08 (workbench auth):** Next.js middleware in `apps/workbench` gates every route behind a shared-secret cookie except an explicit allowlist (`/trial`, `/report/[id]`), which stay open. Chosen over re-enabling Vercel Deployment Protection because that gate is deployment-wide and would also block the public trial/report pages, and over splitting the public surface into a separate app because `CLAUDE.md` calls for `apps/workbench` to stay the single internal surface. **P2-12 (public report default):** no default — every run (trial or engagement) starts private; making a report URL public requires an explicit, logged per-run action. Chosen as the more conservative of the options `CLAUDE.md` raised, given how existential the confidentiality constraint is; this closes the "raise with Sophie" item in `CLAUDE.md`'s decision list. |
| 3.1.1 | 2026-07-29 | **Rename, no scope/status change.** The Warden product is renamed to **Artemis** throughout `CLAUDE.md`, this file, `docs/BUILD_PLAN.md`, and `apps/marketing`/`apps/workbench` (nav label and route `/products/warden` → `/products/artemis`, page component, content exports, test assertions, the synthetic-findings tool list). `packages/wsl` and the `.wsl` rule-file extension are unaffected — WSL is the rule language's own name, not derived from the product name. `CHANGELOG.md`'s already-written entries are left as historical record of what shipped under the old name; a new entry documents the rename itself. |

---

## Versioning Standard

This file's version is independent of the codebase's own version/tags and only tracks the
scaffold document itself.

- **Semver for the document:** `MAJOR.MINOR.PATCH`.
  - **MAJOR** — a structural/schema change (e.g. v2.0.0's move from "current-phase-only" to
    "all-phases-upfront"; v3.0.0's phase-plan restructuring and item-ID remapping below).
  - **MINOR** — a phase's checklist is added in detail, a phase's status changes (e.g.
    Not Started → Next → Done), or items are added/removed within a phase.
  - **PATCH** — wording, typo, or formatting fixes with no status or scope change.
- **Item IDs:** every checklist line has a stable ID, `P{phase}-{seq}` (e.g. `P4-07`).
  IDs are assigned once and never renumbered or reused **once real work has referenced them**
  (a merged PR, a checked-off item) — this keeps references in commits, PRs, and future audit
  trails valid. A dropped item stays in the list marked 🔁 Deferred (or is struck through with
  a reason) rather than deleted. v3.0.0 remapped several never-started phases' IDs wholesale
  (see Revision History) — that is the one case where remapping is acceptable, because no
  history existed yet to break.
- **Status legend** (applies to phases and individual items):

  | Symbol | Meaning |
  |---|---|
  | ✅ | Done — acceptance test passed |
  | 🔧 | In Progress |
  | ▶️ | Next — queued, immediately follows the current phase |
  | ⏸ | Not Started |
  | ⛔ | Blocked — blocking decision or dependency noted inline |
  | 🔁 | Deferred — moved out of this phase's scope, reason noted inline |

- **Phasing discipline is unchanged:** per `CLAUDE.md`'s working agreement, only the active
  phase's checklist is actually worked. Writing Phases 2–11 out in full below is planning and
  traceability, not permission to start building them early — each phase still waits on its
  predecessor's acceptance test.

---

## Project Summary

Valence is a Web3 security firm. The near-term product is a triage workbench for pre-audits —
the readiness review a protocol runs before (or instead of) a paid security audit — letting one
auditor run a battery of analysis tools against a client's Solidity repo, dedupe and suppress
the noise, and produce a defensible readiness report. Layered inside that same workbench, and
now the priority build target, is Artemis/Scout/Foil: a formal-verification engine, an AI agent
that infers intent and writes verification rules for it, and a mutation-testing tool that
scores whether those rules actually catch anything — the same three-product shape as Certora's
Prover/AutoProver/Gambit lineup, EVM-only for v1. Full spec lives in
[`CLAUDE.md`](../CLAUDE.md).

**Inferred intent:** Build the internal auditor workbench first, but treat its UI as a
marketing funnel too — every non-confidential Artemis/Scout/Foil run gets a permanent, shareable
report URL, because a real proof result on a real repo sells the product better than a landing
page. This is a deliberate, explicit amendment to "workbench before client portal," scoped to
the automated-engine product line only; client-engagement work stays private by default.
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
| `apps/workbench` | 🔧 Partial | Shared-secret middleware auth gate (P2-08) with `/trial` and `/report/[id]` allowlisted public; engagement list (`/`) and engagement detail with run history and a live SSE log viewer (`/engagements/[id]`) done (P2-01, P2-02); triage queue list view (`/triage`) done, seeded with 100 synthetic findings (P2-03). Triage actions, trial flow, and report page still to come |
| CI | ✅ Done | GitHub Actions; now also runs `workers/orchestrator`'s Docker-backed sandbox test |
| Lint | ❌ Missing | `eslint`/`next lint` were never wired up in Phase 0; both scripts now fail loudly and honestly rather than silently no-op |
| Tests | ✅ Done | `apps/api`: health, engagement intake, SSE log streaming (all against a real DB/Redis). `workers/orchestrator`: hardened-container wall-clock kill, and the Phase 1 acceptance test (real clone + hardened build + determinism check against a real public repo). No test infra yet for Python workers (don't exist yet) |
| Git repository | ✅ Done | `github.com/reigndario/valence`, Phase 0 merged to `main` via PR #1, sandbox-strategy decision doc merged via PR #2, Phase 1 merged via PR #3 |
| Vercel deployment | 🔧 Partial | `apps/workbench` project created; Deployment Protection currently disabled per Sophie's call (see `CLAUDE.md` note) |
| `apps/marketing` | ✅ Done | Multi-page public site (home, Artemis/Scout/Foil as standalone tabs, Security Services/Audits/Enterprise/Pricing, About, Docs, $0.99, Contact, Terms, Privacy) with a keyboard-operable nav and a universal hamburger menu at every screen width, builds and typechecks clean, not yet deployed to its own Vercel project |
| `apps/portal` | ⏸ Not Started | Phase 8 |
| `apps/api` product routes | 🔧 Partial | Engagement intake (`POST`/`GET /engagements`, `GET /engagements/:id`), SSE log streaming (`GET /engagements/:id/logs`), and run listing (`GET /engagements/:id/runs`, backed by the new `runs` table) done; auth, orgs, findings still to come |
| `packages/findings`, `packages/report` | ⏸ Not Started | Phase 3 (`findings`), Phase 4 (`report`) |
| `packages/sdk`, `packages/cli` | ⏸ Not Started | Not yet scheduled to a specific phase |
| `packages/wsl`, `packages/wsl-compiler`, `packages/trace` | ⏸ Not Started | Phase 5 (Artemis) |
| `packages/scout-agent` | ⏸ Not Started | Phase 6 (Scout) |
| `packages/foil` | ⏸ Not Started | Phase 7 (Foil) |
| `workers/orchestrator` | ✅ Done | BullMQ consumer + the full Phase 1 sandbox pipeline (clone, hardened build, determinism check, artifact persistence) |
| `workers/analysis` | ⏸ Not Started | Phase 3 |
| `workers/engines` | ⏸ Not Started | Phase 5 (Artemis) — verification engine adapters, solver pool management |
| `workers/review` | ⏸ Not Started | Phase 6 (Scout) — retrieval and proposal generation |
| Sandboxed build execution | ✅ Done | Hardened Docker (runc): read-only rootfs, tmpfs workspace, dropped caps, seccomp, no-new-privileges, network cut after dependency fetch, memory/CPU caps, wall-clock kill — see Phase 1 below |
| `corpus/` | ⏸ Not Started | Phase 6 (Scout) |
| Deployment config (Vercel/Railway) | ⏸ Not Started | Hosting split decided (see `CLAUDE.md`) but no actual Vercel/Railway project wired up yet |

---

## Phase Index

| Phase | Name | Status | Acceptance test |
|---|---|---|---|
| 0 | Skeleton | ✅ Done — 2026-07-28 | `docker compose up`, `make demo` green |
| 1 | Intake and sandbox | ✅ Done — 2026-07-28 | Point it at a real public Foundry repo, get a reproducible build and a stored artifact set |
| 2 | Marketing funnel UI v1 | 🔧 In Progress | Public trial flow on a real repo gets a no-login, CTA'd report URL; 100 synthetic findings triaged in under an hour |
| 3 | Analysis battery v1 | ⏸ Not started | Run on a repo with known issues produces a deduped finding set; re-running with suppressions applied is quieter |
| 4 | Report generation | ⏸ Not started | Produce a report on a public repo defensible enough to send a paying client |
| 5 | Artemis v1 | ⏸ Not started | Correct ERC20 proves; broken `transferFrom` returns `VIOLATED` with a correct call trace; unbounded loop returns `UNKNOWN` with a stated reason |
| 6 | Scout v1 | ⏸ Not started | Point it at a real small protocol with no spec — produces a working rule set plus a bug-hunting finding, retries an `UNKNOWN` before surfacing it |
| 7 | Foil v1 | ⏸ Not started | A vacuous spec is flagged by a surviving mutant that names the exact hole |
| 8 | Client portal and remediation loop | ⏸ Not started | Re-run against a fix commit, diff findings, verify each claimed fix, issue a delta report |
| 9 | Property testing and invariants | ⏸ Not started | Extract invariants for a real protocol, run them, report which hold under fuzzing |
| 10 | CI and continuous mode | ⏸ Not started | GitHub App posts checks per commit, gated against last accepted baseline, for findings and Artemis/Scout rules alike |
| 11 | Commercial | ⏸ Not started | Multi-tenant orgs, per-engagement pricing/quotas, Stripe, RBAC, access logging |

Mirrored in [`docs/BUILD_PLAN.md`](./BUILD_PLAN.md), which is the lighter-weight status-only
view; this file carries the task-level detail.

---

## Build Phases

## Phase 0: Skeleton — ✅ Done

**Goal:** Monorepo, compose with Postgres and Redis, migrations, CI, health endpoints.
**Depends on:** Nothing — starting point.
**Estimated scope:** Small — closed out 2026-07-28.

### Checklist

- [x] **P0-01** Scaffold pnpm workspace (`pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`)
- [x] **P0-02** Build `apps/api` (Fastify) with `GET /health` checking real Postgres + Redis connectivity
- [x] **P0-03** Build `apps/workbench` (Next.js 15) with a page that server-fetches `apps/api`'s `/health`
- [x] **P0-04** Write `infra/docker-compose.yml` (Postgres 16, Redis 7, `dbmate` migrate step, `api`)
- [x] **P0-05** Write first `dbmate` migration (`infra/migrations/20260728120000_init.sql`)
- [x] **P0-06** Write `.github/workflows/ci.yml` (install → migrate → typecheck → build → test → smoke-test `/health`)
- [x] **P0-07** Write `Makefile` with `make demo` (compose up, migrate, build+start api, poll `/health`)
- [x] **P0-08** Write `apps/api/src/health.test.ts` as an integration test against real Postgres/Redis
- [x] **P0-09** Run `pnpm install`, `pnpm -r typecheck`, `pnpm -r build` clean
- [x] **P0-10** Run `make demo` and confirm `{"status":"ok","checks":{"postgres":"ok","redis":"ok"}}`
- [x] **P0-11** Run `apps/api` test suite against the live compose stack — passing
- [x] **P0-12** Boot `apps/workbench` in dev mode and confirm it actually reaches `apps/api` at runtime

---

## Phase 1: Intake and Sandbox — ✅ Done

**Goal:** Engagement model, repo clone at pinned commit, sandboxed build across a solc matrix,
streamed logs, artifact persistence.
**Depends on:** Phase 0 complete.
**Estimated scope:** Large — this phase includes the project's core security boundary.
**Closed out:** 2026-07-28.

### Checklist

- [x] **P1-01** Design and migrate the `engagements` table (repo URL, pinned commit, scope globs, docs
      links, deadline) via a new `infra/migrations/*.sql` file
- [x] **P1-02** Add Kysely type definitions for `engagements` in `apps/api`
- [x] **P1-03** Build engagement intake: API route to create an engagement record
- [x] **P1-04** Stand up `workers/orchestrator` (TS) as a BullMQ queue consumer skeleton
- [x] **P1-05** Implement pinned-commit clone into an isolated workspace (tmpfs, read-only root)
- [x] **P1-06** Resolve the solc build matrix and run `forge build` per version, inside a hardened
      Docker container (runc) — see decision below
- [x] **P1-07** Harden the build container: read-only rootfs, tmpfs workspace, dropped capabilities,
      seccomp profile, `no-new-privileges`
- [x] **P1-08** Enforce no network egress after dependency fetch, memory/CPU caps, hard wall-clock kill
- [x] **P1-09** Add a determinism check: build twice, diff artifacts
- [x] **P1-10** Stream build logs from the sandbox back through SSE on `apps/api`
- [x] **P1-11** Persist build artifacts to a Railway Volume attached to `workers/orchestrator`
- [x] **P1-12** Add `NOT_IMPLEMENTED` responses (never a fabricated pass) for any sub-step not yet built
- [x] **P1-13** Write a test that clones a real public Foundry repo end to end and asserts a reproducible
      build plus a stored artifact set (this is the phase's acceptance test — automate it)
- [x] **P1-14** Update `docs/BUILD_PLAN.md` status table and this file when the acceptance test passes

> **Decided (2026-07-28):** Sandbox strategy is hardened Docker (runc), not gVisor or
> Firecracker, for Phase 1 — ships on Railway with no new infrastructure. Explicit tradeoff:
> revisit (gVisor first) before the first paying engagement runs an adversarial repo through
> it. Full reasoning in `CLAUDE.md`.

> **Decision required (still open — raise with Sophie):** Whether the first paying engagements
> are run entirely by hand while the workbench is built. Didn't block Phase 1's code, but
> still changes how urgently later phases (triage UI, report generation) need to ship and
> whether manual workarounds are acceptable until they do.

> **Decided (2026-07-28):** Artifact storage is a Railway Volume (plain block storage), not an
> object-storage vendor — the infra footprint is Railway + Vercel + Docker Desktop locally,
> nothing else. Tradeoff: no presigned-URL downloads; Phase 8's client portal will proxy file
> downloads through `apps/api` instead of handing out direct links. **Implemented (local dev)
> as a Docker named volume (`valence-artifacts`)** mounted into the hardened build containers
> — the faithful local stand-in for a Railway Volume attached to `workers/orchestrator`, and
> deliberately not a host bind-mount: Solidity build output legitimately contains
> case-colliding sibling paths (`out/Test.sol` vs `out/test.sol`), which breaks on a
> case-insensitive host filesystem (macOS/Docker Desktop) but not on the named volume's real
> Linux filesystem. This same volume, same reasoning, now also holds Artemis/Scout/Foil
> artifacts (counterexamples, traces, mutation output) once those phases exist — do not reopen
> the storage decision for them.

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

## Phase 2: Marketing Funnel UI v1 — 🔧 In Progress

**Goal:** The workbench shell (engagement/run list, log viewer) plus the full keyboard-driven
triage-queue interaction set — promote, demote, merge, set severity, attach span, write
narrative — built now even though it's empty of real findings until Phase 3, because this is
where Sophie will spend working hours and it needs to be fast, not pretty, from the start.
Also: the self-serve trial flow and a permanent, shareable public report URL for
non-confidential runs — the UI doubles as the marketing funnel for this product line, per
`CLAUDE.md`.
**Depends on:** Phase 1 complete (needs real engagement/run/log data to render against; the
report page's first real content is Phase 1's build-reproducibility result).
**Estimated scope:** Large — first real product surface in `apps/workbench`, plus a new
public-facing surface (trial flow + shareable report) that has to work convincingly with only
Phase 1's data behind it.
**Acceptance test:** two parts — (A) point the public trial flow at a real public Foundry repo,
get a report URL reachable with no login, styled with a clear CTA, that Sophie would be
comfortable posting publicly; (B) triage a hundred synthetic findings down to a working set in
under an hour, to prove the queue interactions are fast enough once Phase 3 supplies real ones.

### Checklist

- [x] **P2-01** Design the engagement/run list view in `apps/workbench` (Phase 1's engagement +
      run data as input). Required adding a `runs` table + `GET /engagements` and
      `GET /engagements/:id/runs` to `apps/api` first — Phase 1 computed a `PipelineResult` but
      never persisted it anywhere queryable; see the 2026-07-29 migration
      `20260729120000_runs.sql` and `workers/orchestrator/src/persist-run.ts`.
- [x] **P2-02** Wire the log viewer to Phase 1's SSE log stream. Verified end-to-end manually
      (Redis `PUBLISH` on `valence:logs:engagement:*` → SSE `data:` event → parsed by the
      client `LogViewer` component), not just typechecked.
- [x] **P2-03** Built the triage queue list view (`apps/workbench/app/triage/page.tsx`), seeded
      with 100 deterministically-generated synthetic findings (`apps/workbench/lib/findings.ts`,
      fixed-seed `mulberry32` PRNG so the set is stable across reloads — needed for the P2-15
      timed-triage acceptance test to be repeatable). Severity is a placeholder 4-level enum,
      not the real severity model (that's still an open decision blocking Phase 3). Linked from
      the engagement list (`/`) via a "Triage queue →" nav link. No promote/demote/merge
      actions yet — that's P2-04.
- [ ] **P2-04** Implement keyboard shortcuts for promote / demote / merge / set-severity
- [ ] **P2-05** Build the finding detail view: code span rendering, linked reproduction/test
      placeholder
- [ ] **P2-06** Build the narrative editor per finding
- [ ] **P2-07** Add `apps/api` routes for finding mutation (promote/demote/merge/severity/
      narrative) against whatever finding rows exist (synthetic now, real from Phase 3)
- [x] **P2-08** ~~⛔ Decide~~ Auth approach decided (2026-07-29): Next.js middleware in
      `apps/workbench` gates all routes behind a shared-secret cookie except an explicit
      allowlist (`/trial`, `/report/[id]`) — see Revision History v3.1.0. Implementation still
      to build.
- [ ] **P2-09** Persist triage actions and a per-action audit trail in Postgres
- [ ] **P2-10** Design and build the self-serve trial flow: submit a public repo URL, enqueue
      against Phase 1's sandbox pipeline, no auth required
- [ ] **P2-11** Build the public, permanent, shareable report URL page (unauthenticated route),
      rendering whatever Phase 1 produces (build reproducibility, artifact set), styled with a
      clear CTA toward the product
- [ ] **P2-12** Implement the explicit per-run public/shareable opt-in. Decided (2026-07-29,
      see Revision History v3.1.0): no public-by-default for any run type — every run starts
      private, sharing requires an explicit, logged per-run action. Implementation still to
      build.
- [ ] **P2-13** Style pass on both surfaces: "fast, not pretty" for the triage queue;
      "convincing, not internal-tool-looking" for the public funnel page
- [ ] **P2-14** Acceptance test A: run the public trial flow against a real public Foundry repo
      end to end, confirm a no-login report URL with a clear CTA
- [ ] **P2-15** Acceptance test B: time a full triage pass of 100 synthetic findings through the
      queue UI, confirm under an hour

> **Decided (2026-07-29):** No public-by-default for any run type. Every run — trial or
> engagement — starts private; making its report URL shareable requires an explicit, logged
> per-run action. This closes the corresponding "raise with Sophie" item in `CLAUDE.md`.

---

## Phase 3: Analysis Battery v1 — ⏸ Not Started

**Goal:** Slither, Aderyn, SMTChecker, forge test and coverage adapters. Canonical finding
model, dedup, clustering, suppression with reasons.
**Depends on:** Phase 1 complete for the sandbox pipeline the adapters run against; sequenced
after Phase 2 so the findings it produces have a triage queue and report page to land in
immediately, not because Phase 2 is a hard technical prerequisite.
**Estimated scope:** Large — introduces `packages/findings` and `workers/analysis`, the second
major new surface after the sandbox.
**Acceptance test:** a run on a repo with known issues produces a deduped finding set, and
re-running with suppressions applied produces a quieter set.

### Checklist

- [ ] **P3-01** ⛔ Resolve the severity model decision (Code4rena/Sherlock impact×likelihood
      matrix vs. a custom one) — blocks the finding schema shape, raise with Sophie first
- [ ] **P3-02** Design the canonical finding model in `packages/findings` (severity, code span,
      tool source, finding-vs-observation status, reproduction evidence)
- [ ] **P3-03** Add Postgres migration(s) for `findings`, `runs`, `suppressions` tables
- [ ] **P3-04** Stand up `workers/analysis` (Python) as the adapter host with a uniform
      contract in/out, consumed via the same BullMQ queue as `workers/orchestrator`
- [ ] **P3-05** Build the Slither adapter, normalized to the canonical finding model, with
      per-project detector tuning
- [ ] **P3-06** Build the Aderyn adapter, normalized output
- [ ] **P3-07** Build the solc SMTChecker adapter (cheap first pass) plus compiler warnings at
      strictest settings
- [ ] **P3-08** Build the `forge test` adapter (pass/fail ingestion)
- [ ] **P3-09** Build the `forge coverage` adapter with a gap report per function and per branch
      on in-scope files
- [ ] **P3-10** Implement dedup across tool outputs (same underlying issue surfaced by more
      than one tool)
- [ ] **P3-11** Implement clustering of related findings
- [ ] **P3-12** Implement the suppression layer: per-project, persisted, stored reason,
      survives across re-runs
- [ ] **P3-13** Add `NOT_IMPLEMENTED` handling for any adapter or sub-step not yet built
- [ ] **P3-14** Wire real findings into Phase 2's triage queue and public report page,
      replacing the synthetic seed data
- [ ] **P3-15** Acceptance test: run against a repo with known issues, assert a deduped finding
      set; re-run with suppressions applied, assert a quieter result

---

## Phase 4: Report Generation — ⏸ Not Started

**Goal:** Versioned markdown source, PDF and HTML output, readiness verdict with named blocker
gates, scope statistics, coverage gap section, invariant inventory section.
**Depends on:** Phase 2 (triage queue) and Phase 3 (real findings) complete — the report is
generated from the triaged/accepted set.
**Estimated scope:** Medium-large.
**Acceptance test:** produce a report on a public repo Sophie would be willing to send to a
paying client.

### Checklist

- [ ] **P4-01** Design the report-as-markdown-source format in `packages/report`, with
      templates per report type
- [ ] **P4-02** Build the readiness-verdict logic against concrete blocker gates: deterministic
      build, tests pass on a clean clone, coverage above a stated line, invariants documented,
      access control/upgradeability documented, no unresolved high/critical
- [ ] **P4-03** Build the scope-statistics generator (contracts, nSLOC, cyclomatic complexity,
      external call surface, dependency versions, inheritance depth)
- [ ] **P4-04** Build the coverage/test-gap report section from Phase 3's coverage adapter data
- [ ] **P4-05** Build the invariant-inventory section (placeholder structure; fully populated
      once Phase 5's Artemis rules and Phase 9's property-testing campaigns exist)
- [ ] **P4-06** Implement PDF rendering from the markdown source
- [ ] **P4-07** Implement HTML rendering from the markdown source
- [ ] **P4-08** Enforce the mandatory "readiness review, not a substitute for a security audit"
      disclaimer on every report artifact — hard constraint, not optional copy
- [ ] **P4-09** ⛔ Resolve whether Valence sells to audit firms as a tooling layer (affects what
      the report is optimized for) before templates lock
- [ ] **P4-10** Acceptance test: generate a full report on a public repo, confirm it's
      client-defensible

---

## Phase 5: Artemis v1 — ⏸ Not Started

**Goal:** Compile WSL to a verification IR, emit an engine harness, dispatch to the chosen
verification engine, return the four-state result (`PROVED`/`VIOLATED`/`UNKNOWN`/`ERROR`) with
a counterexample and call trace.
**Depends on:** Phase 1 (sandbox) and Phase 2 (UI + report URL to surface results in) complete.
**Estimated scope:** Large — new spec language, compiler, and engine-integration surface; the
engine decision below has to be resolved before most of this phase can start.
**Acceptance test:** a correct ERC20 proves; a deliberately broken `transferFrom` returns
`VIOLATED` with a correct call trace; an unbounded loop returns `UNKNOWN` with a stated reason.

### Checklist

- [ ] **P5-01** ⛔ Resolve the engine decision with Sophie (Option A: orchestrate open-source
      engines — Halmos, hevm, SMTChecker; Option B: fork the Certora Prover, GPLv3 copyleft
      risk; Option C: build a VC generator + solver-portfolio dispatch) — blocks every other
      item in this phase, see `CLAUDE.md`'s Artemis section for full tradeoffs
- [ ] **P5-02** Build `packages/wsl`: lexer, parser, AST
- [ ] **P5-03** Build the WSL typechecker against contract ABIs
- [ ] **P5-04** Build the WSL formatter (must be idempotent)
- [ ] **P5-05** Write the ERC20/ERC4626/basic-access-control WSL corpus as the language's
      proving ground
- [ ] **P5-06** Build `packages/wsl-compiler`: WSL AST → verification IR
- [ ] **P5-07** Build the verification-IR → engine-harness emission for the chosen engine
      (P5-01)
- [ ] **P5-08** Stand up `workers/engines` (Python) with the chosen engine adapter, uniform
      four-state contract
- [ ] **P5-09** Implement solver pool management (Z3, CVC5, Bitwuzla as applicable to the
      chosen engine)
- [ ] **P5-10** Build `packages/trace`: counterexample and call trace model
- [ ] **P5-11** Build counterexample/call-trace rendering in `apps/workbench` (v1 can be plain;
      full expandable-call-tree richness is a later pass, not blocking)
- [ ] **P5-12** Enforce rule-status honesty: four-state enum, `UNKNOWN` always carries a
      machine-readable reason, never rendered green
- [ ] **P5-13** Implement run determinism: pin solc/engine/solver versions plus a seed,
      content-hash the input tree
- [ ] **P5-14** Wire Artemis run results into Phase 2's public report page and Phase 4's
      invariant-inventory section
- [ ] **P5-15** Acceptance test: correct ERC20 proves; deliberately broken `transferFrom`
      returns `VIOLATED` with a correct call trace; unbounded loop returns `UNKNOWN` with a
      stated reason

---

## Phase 6: Scout v1 — ⏸ Not Started

**Goal:** Intent inference from code and docs, WSL rule generation from that intent (dispatched
through Artemis), a separate bug-hunting pass, a retry-on-failure loop, a three-part report.
Absorbs what was previously scoped as the standalone "LLM review pipeline" — same evidence-gate
principle, wider job, not a separate track.
**Depends on:** Phase 5 (Artemis) complete — Scout writes ordinary Artemis rules, not a separate
result type.
**Estimated scope:** Large — the confidentiality and evidence-gate requirements make this the
highest-stakes phase in the plan.
**Acceptance test:** point Scout at a real small protocol with no existing spec — it produces a
working rule set plus at least one bug-hunting finding, and on a rule that comes back unknown
it demonstrably retries with a revised approach before surfacing the failure.

### Checklist

- [ ] **P6-01** ⛔ Resolve whether to run client code through a hosted LLM at all, and under
      what provider terms — confidentiality-blocking, must be settled before any other item in
      this phase starts
- [ ] **P6-02** ⛔ Resolve whether Scout's model calls run through a hosted provider or
      something self-hostable, for enterprise clients who will not send code externally
- [ ] **P6-03** Build `corpus/`: curated exploit and past-finding corpus, versioned, cited,
      tagged by vulnerability class and protocol type — never client data
- [ ] **P6-04** Build the retrieval layer against the corpus
- [ ] **P6-05** Build chunking by contract and function with call-graph neighbors, not by token
      window
- [ ] **P6-06** Build `packages/scout-agent`: intent inference from code and docs
- [ ] **P6-07** Build WSL rule generation from inferred intent, dispatched through
      `packages/wsl-compiler` — every generated rule gets the same four-state treatment as a
      human-written one
- [ ] **P6-08** Build the separate bug-hunting pass: structured proposal generation
      (vulnerability class, file/line span, preconditions, impact, proposed Foundry test)
- [ ] **P6-09** Stand up `workers/review` (Python) as Scout's retrieval and proposal-generation
      host
- [ ] **P6-10** Implement the evidence gate: execute the proposed test against the repo;
      promote to candidate finding if it fails, demote to observation automatically if it
      passes
- [ ] **P6-11** Build the retry-on-failure loop: on a rule that returns `UNKNOWN`, automatically
      retry with a revised summarization or a tighter bound before surfacing the failure to the
      auditor
- [ ] **P6-12** Implement per-engagement encryption at rest and no-cross-tenant retrieval for
      this stage specifically
- [ ] **P6-13** Enforce no client code enters a prompt sent to a provider without an explicit
      per-engagement setting
- [ ] **P6-14** Build the three-part report: code bugs, design bugs, full rule status
- [ ] **P6-15** Build promotion-rate metric tracking, per run and over time
- [ ] **P6-16** Add an audit log of every access to client code in this pipeline
- [ ] **P6-17** Acceptance test: point Scout at a real small protocol with no existing spec —
      produces a working rule set plus at least one bug-hunting finding, and on a rule that
      comes back unknown, demonstrably retries with a revised approach before surfacing the
      failure

---

## Phase 7: Foil v1 — ⏸ Not Started

**Goal:** Mutant generation over the source, a campaign runner against the WSL rule suite, a
survivor report, and a mutation-score dashboard in the workbench.
**Depends on:** Phase 5 (Artemis) complete — Foil mutates against the WSL rule suite Artemis
executes.
**Estimated scope:** Medium-large.
**Acceptance test:** a vacuous spec is flagged by a surviving mutant that names the exact hole.

### Checklist

- [ ] **P7-01** Build `packages/foil`: semantic mutant generator over Solidity source
- [ ] **P7-02** Build the campaign runner: rerun the WSL rule suite (via Artemis) against each
      mutant
- [ ] **P7-03** Implement survivor detection: a mutant that survives means no rule caught it
- [ ] **P7-04** Build the survivor report, naming the exact hole (which rule or code path went
      untested)
- [ ] **P7-05** Build the mutation-score calculation, per contract and per rule
- [ ] **P7-06** Build the mutation-score dashboard in `apps/workbench`
- [ ] **P7-07** Wire Foil results into Phase 2's public report page
- [ ] **P7-08** 🔁 Deferred — live-score WebSocket channel into an editor extension; explicitly
      out of scope for v1 per `CLAUDE.md` ("Foil v1 is the campaign runner and dashboard only")
- [ ] **P7-09** Acceptance test: a vacuous spec is flagged by a surviving mutant that names the
      exact hole

---

## Phase 8: Client Portal and Remediation Loop — ⏸ Not Started

**Goal:** Client sees findings, replies, marks fixed. Re-run against the fix commit, diff
findings, verify each claimed fix, issue a delta report.
**Depends on:** Phase 4 complete (delta report reuses the report engine).
**Estimated scope:** Large — new app (`apps/portal`) plus a second full pipeline run path.
**Acceptance test:** re-run against a fix commit, diff findings, verify each claimed fix, issue
a delta report.

### Checklist

- [ ] **P8-01** Build `apps/portal` skeleton (Next.js 15, own Vercel project)
- [ ] **P8-02** Implement client-facing auth, separate from internal `apps/workbench` auth
- [ ] **P8-03** Build the client-facing findings view (read-only, remediation status)
- [ ] **P8-04** Build the client reply/comment flow per finding
- [ ] **P8-05** Build the client "mark fixed" action
- [ ] **P8-06** Implement re-run against a fix commit, reusing Phase 1's sandbox pipeline
- [ ] **P8-07** Implement finding-diff logic (baseline run vs. fix-commit run)
- [ ] **P8-08** Implement automated verification per claimed fix
- [ ] **P8-09** Build delta-report generation, extending Phase 4's report engine
- [ ] **P8-10** Implement file-download proxying through `apps/api` (no presigned URLs — Railway
      Volume decision, see `CLAUDE.md`)
- [ ] **P8-11** Re-enable Vercel Deployment Protection (Standard) on `apps/workbench` before any
      real engagement data renders there — explicit `CLAUDE.md` gate, do not skip
- [ ] **P8-12** Acceptance test: full remediation loop against a real fix commit produces a
      correct delta report

---

## Phase 9: Property Testing and Invariants — ⏸ Not Started

**Goal:** Invariant inventory as a first-class object. ABI-driven handler generation, Medusa or
Echidna campaigns, halmos standard property sets — complementary to Phase 5's Artemis proofs
rather than duplicating them: fuzzing catches what an unbounded WSL rule can't afford to check
exhaustively, and vice versa.
**Depends on:** Phase 3 complete (needs the finding/contract model); can run in parallel with
Phases 4–8 if useful, but not started before Phase 3's acceptance test passes.
**Estimated scope:** Large — fuzzing campaigns and symbolic checks are the most compute-heavy
stage in the battery.
**Acceptance test:** extract invariants for a real protocol, run them, report which hold under
fuzzing and which are unproven.

### Checklist

- [ ] **P9-01** Design the invariant-inventory data model, persisted and linked to
      contracts/functions
- [ ] **P9-02** Build the ABI-driven first-cut invariant handler generator
- [ ] **P9-03** Integrate a Medusa campaign runner
- [ ] **P9-04** Integrate an Echidna campaign runner (alternative/complement to Medusa)
- [ ] **P9-05** Integrate Foundry invariant tests as a third source
- [ ] **P9-06** Integrate halmos on standard property sets (ERC20, ERC4626, ERC721, access
      control, pausability)
- [ ] **P9-07** Label every bounded check explicitly as bounded, with the bound stated in the
      report — do not oversell
- [ ] **P9-08** Wire invariant results into Phase 4's report invariant-inventory section,
      alongside Phase 5's Artemis rule results
- [ ] **P9-09** Acceptance test: extract invariants for a real protocol, run under fuzzing,
      report hold/unproven status

---

## Phase 10: CI and Continuous Mode — ⏸ Not Started

**Goal:** GitHub App posting checks per commit, regression gating against the last accepted
baseline — for static-analysis findings and Artemis/Scout rule results alike. The
recurring-revenue product: a pre-audit is one-off, continuous monitoring between audits is a
subscription.
**Depends on:** Phase 8 complete (reuses the diff/verification logic from the remediation
loop).
**Estimated scope:** Medium.
**Acceptance test:** a connected repo's commit produces a posted check run, gated against the
last accepted baseline.

### Checklist

- [ ] **P10-01** Build GitHub App registration and webhook handling
- [ ] **P10-02** Implement per-commit check-run creation, posted back to the GitHub PR
- [ ] **P10-03** Implement regression gating against the last accepted baseline for
      static-analysis findings, reusing Phase 8's diff logic
- [ ] **P10-04** Implement regression gating against the last accepted baseline for Artemis/
      Scout rule results specifically (a rule that used to prove and now doesn't is a
      regression even with zero new findings)
- [ ] **P10-05** Implement subscription-tier scoping for continuous mode, distinct from a
      one-off pre-audit engagement
- [ ] **P10-06** Acceptance test: push a commit to a connected repo, confirm a check run posts
      with the correct pass/fail against baseline

---

## Phase 11: Commercial — ⏸ Not Started

**Goal:** Multi-tenant orgs, per-engagement pricing and quotas, Stripe, RBAC, access logging.
Enterprise packaging on top (seats, SSO, VPC/on-prem for teams that will not send code
externally) is a "raise with Sophie" item, not decided or scoped here.
**Depends on:** Phase 10 complete (or at minimum Phase 8 — commercial packaging assumes the
product loop is real); genuinely last in sequence since it monetizes what phases 0–10 built.
**Estimated scope:** Large — this is the transition from internal tool to sellable product.
**Acceptance test:** distinct orgs cannot access each other's engagements/findings; billing
quota enforcement works end to end.

### Checklist

- [ ] **P11-01** Design the multi-tenant org data model
- [ ] **P11-02** Implement RBAC across `apps/api` routes
- [ ] **P11-03** Integrate Stripe billing (per-engagement pricing and quotas)
- [ ] **P11-04** Build access logging across all client-data touchpoints (extends Phase 6's
      audit-log requirement to the whole system)
- [ ] **P11-05** Acceptance test: distinct orgs cannot access each other's engagements/findings;
      billing quota enforcement verified end to end

---

## Open Questions

Tracked so they don't get decided by default inertia. Full list with phase mapping in
[`docs/BUILD_PLAN.md`](./BUILD_PLAN.md#pending-decisions-blocking-future-phases):

- The Artemis engine decision — Option A (orchestrate open-source engines) vs. B (fork Certora
  Prover, GPLv3) vs. C (build a VC generator + solver portfolio) (blocks **P5-01**)
- Whether WSL aims for source compatibility with CVL — helps adoption, real legal/design
  constraint to weigh first (blocks the detailed design of **P5-02**–**P5-04**)
- Whether Scout's model calls run through a hosted provider or something self-hostable for
  enterprise clients (blocks **P6-02**)
- Whether the self-serve trial flow's "public by default" framing is the right default (blocks
  **P2-12**)
- Severity model (blocks **P3-01**)
- Whether to run client code through a hosted LLM, and under what provider terms (blocks
  **P6-01**)
- Whether Valence sells to audit firms as a tooling layer (blocks **P4-09**)
- Whether the first paying engagements run entirely by hand while the workbench is built
  (affects phase-ordering urgency generally, not a single item)
