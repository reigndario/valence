# SCAFFOLDING.md
> Generated: 2026-07-28
> Doc schema version: **2.0.0** — see [Revision History](#revision-history) and
> [Versioning Standard](#versioning-standard) below.
> Project: Valence
> Stack: pnpm monorepo — Next.js 15 (workbench/portal/marketing, Vercel) / Fastify + TS
> (api, Railway) / Python (analysis + review workers, Railway) / Postgres + Redis (Railway) /
> plain SQL migrations via dbmate / Railway Volume for artifact storage. Infra footprint is
> deliberately just Railway + Vercel + Docker Desktop locally — no AWS, no Cloudflare.
> Current state: Phase 0 skeleton and Phase 1 (intake and sandbox) complete and verified.
> `apps/marketing` (public landing page, jumped the queue ahead of Phase 1) built and
> verified, not yet deployed.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2026-07-28 | Initial scaffold. Task-level checklists for Phase 0 and Phase 1 only; Phases 2–9 listed as one-line "Out of Scope" pointers to `CLAUDE.md`, per the then-standing "no speculative scaffolding for later phases" rule. |
| 2.0.0 | 2026-07-28 | **Schema change.** `CLAUDE.md`'s working agreement amended: full task-level checklists now drafted for all phases (0–9) up front, so the whole roadmap is visible and versioned from day one. Added the item-ID scheme and status legend below for enterprise-style cross-referencing (commits/PRs can cite `P4-07`, etc.). Execution discipline is unchanged — one phase worked at a time, later checklists revised as their turn comes. |

---

## Versioning Standard

This file's version is independent of the codebase's own version/tags and only tracks the
scaffold document itself.

- **Semver for the document:** `MAJOR.MINOR.PATCH`.
  - **MAJOR** — a structural/schema change (e.g. this revision's move from "current-phase-only"
    to "all-phases-upfront").
  - **MINOR** — a phase's checklist is added in detail, a phase's status changes (e.g.
    Not Started → Next → Done), or items are added/removed within a phase.
  - **PATCH** — wording, typo, or formatting fixes with no status or scope change.
- **Item IDs:** every checklist line has a stable ID, `P{phase}-{seq}` (e.g. `P4-07`).
  IDs are assigned once and never renumbered or reused, even if an item is later dropped —
  this keeps references in commits, PRs, and future audit trails valid. A dropped item stays
  in the list marked 🔁 Deferred (or is struck through with a reason) rather than deleted.
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
  phase's checklist is actually worked. Writing Phases 2–9 out in full below is planning and
  traceability, not permission to start building them early — each phase still waits on its
  predecessor's acceptance test.

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
| Git repository | ✅ Done | `github.com/reigndario/valence`, Phase 0 merged to `main` via PR #1, sandbox-strategy decision doc merged via PR #2, Phase 1 merged via PR #3 |
| Vercel deployment | 🔧 Partial | `apps/workbench` project created; Deployment Protection currently disabled per Jeff's call (see `CLAUDE.md` note) |
| `apps/marketing` | ✅ Done | Single public landing page, builds and typechecks clean, not yet deployed to its own Vercel project |
| `apps/portal` | ⏸ Not Started | Phase 5 |
| `apps/api` product routes | 🔧 Partial | Engagement intake (`POST`/`GET /engagements`) and SSE log streaming (`GET /engagements/:id/logs`) done; auth, orgs, findings, runs still to come |
| `packages/findings`, `packages/report`, `packages/sdk`, `packages/cli` | ⏸ Not Started | Phase 2 (`findings`), Phase 4 (`report`); `sdk`/`cli` not yet scheduled to a specific phase |
| `workers/orchestrator` | ✅ Done | BullMQ consumer + the full Phase 1 sandbox pipeline (clone, hardened build, determinism check, artifact persistence) |
| `workers/analysis`, `workers/review` | ⏸ Not Started | Phase 2, Phase 7 respectively |
| Sandboxed build execution | ✅ Done | Hardened Docker (runc): read-only rootfs, tmpfs workspace, dropped caps, seccomp, no-new-privileges, network cut after dependency fetch, memory/CPU caps, wall-clock kill — see Phase 1 below |
| `corpus/` | ⏸ Not Started | Phase 7 |
| Deployment config (Vercel/Railway) | ⏸ Not Started | Hosting split decided (see `CLAUDE.md`) but no actual Vercel/Railway project wired up yet |

---

## Phase Index

| Phase | Name | Status | Acceptance test |
|---|---|---|---|
| 0 | Skeleton | ✅ Done — 2026-07-28 | `docker compose up`, `make demo` green |
| 1 | Intake and sandbox | ✅ Done — 2026-07-28 | Point it at a real public Foundry repo, get a reproducible build and a stored artifact set |
| 2 | Analysis battery v1 | ▶️ Next | Run on a repo with known issues produces a deduped finding set; re-running with suppressions applied is quieter |
| 3 | Triage workbench | ⏸ Not started | Triage 100 raw findings down to a working set in under an hour |
| 4 | Report generation | ⏸ Not started | Produce a report on a public repo defensible enough to send a paying client |
| 5 | Client portal and remediation loop | ⏸ Not started | Re-run against a fix commit, diff findings, verify each claimed fix, issue a delta report |
| 6 | Property testing and invariants | ⏸ Not started | Extract invariants for a real protocol, run them, report which hold under fuzzing |
| 7 | LLM review pipeline | ⏸ Not started | On a repo with a known historical exploit, the pipeline proposes it and the gate promotes it on a failing test |
| 8 | CI and continuous mode | ⏸ Not started | GitHub App posts checks per commit, gated against last accepted baseline |
| 9 | Commercial | ⏸ Not started | Multi-tenant orgs, per-engagement pricing/quotas, Stripe, RBAC, access logging |

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

## Phase 2: Analysis Battery v1 — ▶️ Next

**Goal:** Slither, Aderyn, SMTChecker, forge test and coverage adapters. Canonical finding
model, dedup, clustering, suppression with reasons.
**Depends on:** Phase 1 complete.
**Estimated scope:** Large — introduces `packages/findings` and `workers/analysis`, the second
major new surface after the sandbox.
**Acceptance test:** a run on a repo with known issues produces a deduped finding set, and
re-running with suppressions applied produces a quieter set.

### Checklist

- [ ] **P2-01** ⛔ Resolve the severity model decision (Code4rena/Sherlock impact×likelihood
      matrix vs. a custom one) — blocks the finding schema shape, raise with Jeff first
- [ ] **P2-02** Design the canonical finding model in `packages/findings` (severity, code span,
      tool source, finding-vs-observation status, reproduction evidence)
- [ ] **P2-03** Add Postgres migration(s) for `findings`, `runs`, `suppressions` tables
- [ ] **P2-04** Stand up `workers/analysis` (Python) as the adapter host with a uniform
      contract in/out, consumed via the same BullMQ queue as `workers/orchestrator`
- [ ] **P2-05** Build the Slither adapter, normalized to the canonical finding model, with
      per-project detector tuning
- [ ] **P2-06** Build the Aderyn adapter, normalized output
- [ ] **P2-07** Build the solc SMTChecker adapter (cheap first pass) plus compiler warnings at
      strictest settings
- [ ] **P2-08** Build the `forge test` adapter (pass/fail ingestion)
- [ ] **P2-09** Build the `forge coverage` adapter with a gap report per function and per branch
      on in-scope files
- [ ] **P2-10** Implement dedup across tool outputs (same underlying issue surfaced by more
      than one tool)
- [ ] **P2-11** Implement clustering of related findings
- [ ] **P2-12** Implement the suppression layer: per-project, persisted, stored reason,
      survives across re-runs
- [ ] **P2-13** Add `NOT_IMPLEMENTED` handling for any adapter or sub-step not yet built
- [ ] **P2-14** Acceptance test: run against a repo with known issues, assert a deduped finding
      set; re-run with suppressions applied, assert a quieter result

---

## Phase 3: Triage Workbench — ⏸ Not Started

**Goal:** The queue UI. Keyboard-driven: promote, demote, merge, set severity, attach span,
write narrative.
**Depends on:** Phase 2 complete (needs a real finding set to triage).
**Estimated scope:** Medium-large — this is where Jeff spends working hours, so speed of use
matters more than breadth of feature.
**Acceptance test:** triage a hundred raw findings down to a working set in under an hour.

### Checklist

- [ ] **P3-01** Design the triage queue list view in `apps/workbench` (Phase 2's finding set as
      input)
- [ ] **P3-02** Implement keyboard shortcuts for promote / demote / merge / set-severity
- [ ] **P3-03** Build the finding detail view: code span rendering, linked reproduction/test
- [ ] **P3-04** Build the narrative editor per finding
- [ ] **P3-05** Add `apps/api` routes for finding mutation (promote/demote/merge/severity/narrative)
- [ ] **P3-06** ⛔ Decide auth approach for `apps/workbench` sufficient for single-auditor use
      (currently no application-level auth; Vercel Deployment Protection is off per `CLAUDE.md`)
- [ ] **P3-07** Persist triage actions and a per-action audit trail in Postgres
- [ ] **P3-08** Acceptance test: time a full triage pass of 100 raw findings, confirm under an
      hour

---

## Phase 4: Report Generation — ⏸ Not Started

**Goal:** Versioned markdown source, PDF and HTML output, readiness verdict with named blocker
gates, scope statistics, coverage gap section, invariant inventory section.
**Depends on:** Phase 3 complete (report is generated from the triaged/accepted set).
**Estimated scope:** Medium-large.
**Acceptance test:** produce a report on a public repo Jeff would be willing to send to a
paying client.

### Checklist

- [ ] **P4-01** Design the report-as-markdown-source format in `packages/report`, with
      templates per report type
- [ ] **P4-02** Build the readiness-verdict logic against concrete blocker gates: deterministic
      build, tests pass on a clean clone, coverage above a stated line, invariants documented,
      access control/upgradeability documented, no unresolved high/critical
- [ ] **P4-03** Build the scope-statistics generator (contracts, nSLOC, cyclomatic complexity,
      external call surface, dependency versions, inheritance depth)
- [ ] **P4-04** Build the coverage/test-gap report section from Phase 2's coverage adapter data
- [ ] **P4-05** Build the invariant-inventory section (placeholder structure; fully populated
      once Phase 6 exists)
- [ ] **P4-06** Implement PDF rendering from the markdown source
- [ ] **P4-07** Implement HTML rendering from the markdown source
- [ ] **P4-08** Enforce the mandatory "readiness review, not a substitute for a security audit"
      disclaimer on every report artifact — hard constraint, not optional copy
- [ ] **P4-09** ⛔ Resolve whether Valence sells to audit firms as a tooling layer (affects what
      the report is optimized for) before templates lock
- [ ] **P4-10** Acceptance test: generate a full report on a public repo, confirm it's
      client-defensible

---

## Phase 5: Client Portal and Remediation Loop — ⏸ Not Started

**Goal:** Client sees findings, replies, marks fixed. Re-run against the fix commit, diff
findings, verify each claimed fix, issue a delta report.
**Depends on:** Phase 4 complete (delta report reuses the report engine).
**Estimated scope:** Large — new app (`apps/portal`) plus a second full pipeline run path.
**Acceptance test:** re-run against a fix commit, diff findings, verify each claimed fix, issue
a delta report.

### Checklist

- [ ] **P5-01** Build `apps/portal` skeleton (Next.js 15, own Vercel project)
- [ ] **P5-02** Implement client-facing auth, separate from internal `apps/workbench` auth
- [ ] **P5-03** Build the client-facing findings view (read-only, remediation status)
- [ ] **P5-04** Build the client reply/comment flow per finding
- [ ] **P5-05** Build the client "mark fixed" action
- [ ] **P5-06** Implement re-run against a fix commit, reusing Phase 1's sandbox pipeline
- [ ] **P5-07** Implement finding-diff logic (baseline run vs. fix-commit run)
- [ ] **P5-08** Implement automated verification per claimed fix
- [ ] **P5-09** Build delta-report generation, extending Phase 4's report engine
- [ ] **P5-10** Implement file-download proxying through `apps/api` (no presigned URLs — Railway
      Volume decision, see `CLAUDE.md`)
- [ ] **P5-11** Re-enable Vercel Deployment Protection (Standard) on `apps/workbench` before any
      real engagement data renders there — explicit `CLAUDE.md` gate, do not skip
- [ ] **P5-12** Acceptance test: full remediation loop against a real fix commit produces a
      correct delta report

---

## Phase 6: Property Testing and Invariants — ⏸ Not Started

**Goal:** Invariant inventory as a first-class object. ABI-driven handler generation, Medusa or
Echidna campaigns, halmos standard property sets.
**Depends on:** Phase 2 complete (needs the finding/contract model); can run in parallel with
Phases 3–5 if useful, but not started before Phase 2's acceptance test passes.
**Estimated scope:** Large — fuzzing campaigns and symbolic checks are the most compute-heavy
stage in the battery.
**Acceptance test:** extract invariants for a real protocol, run them, report which hold under
fuzzing and which are unproven.

### Checklist

- [ ] **P6-01** Design the invariant-inventory data model, persisted and linked to
      contracts/functions
- [ ] **P6-02** Build the ABI-driven first-cut invariant handler generator
- [ ] **P6-03** Integrate a Medusa campaign runner
- [ ] **P6-04** Integrate an Echidna campaign runner (alternative/complement to Medusa)
- [ ] **P6-05** Integrate Foundry invariant tests as a third source
- [ ] **P6-06** Integrate halmos on standard property sets (ERC20, ERC4626, ERC721, access
      control, pausability)
- [ ] **P6-07** Label every bounded check explicitly as bounded, with the bound stated in the
      report — do not oversell
- [ ] **P6-08** Wire invariant results into Phase 4's report invariant-inventory section
- [ ] **P6-09** Acceptance test: extract invariants for a real protocol, run under fuzzing,
      report hold/unproven status

---

## Phase 7: LLM Review Pipeline — ⏸ Not Started

**Goal:** Corpus, retrieval, structured proposals, the test-execution evidence gate, promotion
rate metrics.
**Depends on:** Phase 2 complete (proposals need the finding model and triage queue to land
in); Phase 3 helpful (proposals surface in the same queue) but not a hard blocker.
**Estimated scope:** Large — the confidentiality and evidence-gate requirements make this the
highest-stakes phase in the plan.
**Acceptance test:** on a repo with a known historical exploit, the pipeline proposes it and
the gate promotes it on a failing test.

### Checklist

- [ ] **P7-01** ⛔ Resolve whether to run client code through a hosted LLM at all, and under
      what provider terms — confidentiality-blocking, must be settled before any other item in
      this phase starts
- [ ] **P7-02** Build `corpus/`: curated exploit and past-finding corpus, versioned, cited,
      tagged by vulnerability class and protocol type — never client data
- [ ] **P7-03** Build the retrieval layer against the corpus
- [ ] **P7-04** Build chunking by contract and function with call-graph neighbors, not by token
      window
- [ ] **P7-05** Build structured proposal generation: vulnerability class, file/line span,
      preconditions, impact, proposed Foundry test
- [ ] **P7-06** Stand up `workers/review` (Python) as the pipeline host
- [ ] **P7-07** Implement the evidence gate: execute the proposed test against the repo;
      promote to candidate finding if it fails, demote to observation automatically if it
      passes
- [ ] **P7-08** Implement per-engagement encryption at rest and no-cross-tenant retrieval for
      this stage specifically
- [ ] **P7-09** Enforce no client code enters a prompt sent to a provider without an explicit
      per-engagement setting
- [ ] **P7-10** Build promotion-rate metric tracking, per run and over time
- [ ] **P7-11** Add an audit log of every access to client code in this pipeline
- [ ] **P7-12** Acceptance test: repo with a known historical exploit — pipeline proposes it,
      gate promotes it on a failing test

---

## Phase 8: CI and Continuous Mode — ⏸ Not Started

**Goal:** GitHub App posting checks per commit, regression gating against the last accepted
baseline. The recurring-revenue product — a pre-audit is one-off, continuous monitoring
between audits is a subscription.
**Depends on:** Phase 5 complete (reuses the diff/verification logic from the remediation
loop).
**Estimated scope:** Medium.
**Acceptance test:** a connected repo's commit produces a posted check run, gated against the
last accepted baseline.

### Checklist

- [ ] **P8-01** Build GitHub App registration and webhook handling
- [ ] **P8-02** Implement per-commit check-run creation, posted back to the GitHub PR
- [ ] **P8-03** Implement regression gating against the last accepted baseline, reusing Phase
      5's diff logic
- [ ] **P8-04** Implement subscription-tier scoping for continuous mode, distinct from a
      one-off pre-audit engagement
- [ ] **P8-05** Acceptance test: push a commit to a connected repo, confirm a check run posts
      with the correct pass/fail against baseline

---

## Phase 9: Commercial — ⏸ Not Started

**Goal:** Multi-tenant orgs, per-engagement pricing and quotas, Stripe, RBAC, access logging.
**Depends on:** Phase 8 complete (or at minimum Phase 5 — commercial packaging assumes the
product loop is real); genuinely last in sequence since it monetizes what phases 0–8 built.
**Estimated scope:** Large — this is the transition from internal tool to sellable product.
**Acceptance test:** distinct orgs cannot access each other's engagements/findings; billing
quota enforcement works end to end.

### Checklist

- [ ] **P9-01** Design the multi-tenant org data model
- [ ] **P9-02** Implement RBAC across `apps/api` routes
- [ ] **P9-03** Integrate Stripe billing (per-engagement pricing and quotas)
- [ ] **P9-04** Build access logging across all client-data touchpoints (extends Phase 7's
      audit-log requirement to the whole system)
- [ ] **P9-05** Acceptance test: distinct orgs cannot access each other's engagements/findings;
      billing quota enforcement verified end to end

---

## Open Questions

Tracked so they don't get decided by default inertia. Full list with phase mapping in
[`docs/BUILD_PLAN.md`](./BUILD_PLAN.md#pending-decisions-blocking-future-phases):

- Severity model (blocks **P2-01**)
- Whether to run client code through a hosted LLM, and under what provider terms (blocks
  **P7-01**)
- Whether Valence sells to audit firms as a tooling layer (blocks **P4-09**)
- Whether the first paying engagements run entirely by hand while the workbench is built
  (affects phase-ordering urgency generally, not a single item)
