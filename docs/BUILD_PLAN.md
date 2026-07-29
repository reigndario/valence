# BUILD_PLAN.md
> Project: Valence
> Last updated: 2026-07-29

Master phase-by-phase status tracker. The full description of each phase — what it delivers,
its acceptance test — lives in [`CLAUDE.md`](../CLAUDE.md#phase-plan) and is not duplicated
here beyond a one-line summary. Full task-level checklists for every phase (0–11), with stable
`P{phase}-{seq}` item IDs for cross-referencing in commits/PRs, live in
[`docs/SCAFFOLDING.md`](./SCAFFOLDING.md) (schema v3.0.0 — see its own versioning standard).
This file exists to answer "what's done, what's next, what's blocked" at a glance. Per the
working agreement: **one phase worked at a time — later phases' checklists exist and are
versioned from day one, but no code is written against a future phase before the current one's
acceptance test passes.**

## Status

| Phase | Name | Status | Acceptance test |
|---|---|---|---|
| 0 | Skeleton | ✅ Done — 2026-07-28 | `docker compose up`, `make demo` green |
| 1 | Intake and sandbox | ✅ Done — 2026-07-28 | Point it at a real public Foundry repo, get a reproducible build and a stored artifact set |
| 2 | Marketing funnel UI v1 | 🔧 In progress | Public trial flow on a real repo gets a no-login, CTA'd report URL; 100 synthetic findings triaged in under an hour |
| 3 | Analysis battery v1 | ⏸ Not started | Run on a repo with known issues produces a deduped finding set; re-running with suppressions applied is quieter |
| 4 | Report generation | ⏸ Not started | Produce a report on a public repo defensible enough to send a paying client |
| 5 | Artemis v1 | ⏸ Not started | Correct ERC20 proves; broken `transferFrom` returns `VIOLATED` with a correct call trace; unbounded loop returns `UNKNOWN` with a stated reason |
| 6 | Scout v1 | ⏸ Not started | Point it at a real small protocol with no spec — produces a working rule set plus a bug-hunting finding, retries an `UNKNOWN` before surfacing it |
| 7 | Foil v1 | ⏸ Not started | A vacuous spec is flagged by a surviving mutant that names the exact hole |
| 8 | Client portal and remediation loop | ⏸ Not started | Re-run against a fix commit, diff findings, verify each claimed fix, issue a delta report |
| 9 | Property testing and invariants | ⏸ Not started | Extract invariants for a real protocol, run them, report which hold under fuzzing |
| 10 | CI and continuous mode | ⏸ Not started | GitHub App posts checks per commit, gated against last accepted baseline, for findings and Artemis/Scout rules alike |
| 11 | Commercial | ⏸ Not started | Multi-tenant orgs, per-engagement pricing/quotas, Stripe, RBAC, access logging |

Artemis (formal verification), Scout (an AI agent), and Foil (mutation testing) are now the
priority build target inside the existing `apps/workbench`/`packages/*`/`workers/*` structure —
see `CLAUDE.md` for the full product framing. Phase 2 is deliberately a UI phase, pulled ahead
of further backend depth: the workbench shell, the full triage-queue interactions, and a
public, permanent, shareable report URL that doubles as the marketing funnel for non-client
runs.

## Parallel workstream: apps/marketing

Not part of the numbered phase plan above — a small public landing page (`apps/marketing`)
jumped the queue so Valence has a live public surface while the numbered phases continue
underneath it. No auth, no data, single static page, own Vercel project. Doesn't block or get
blocked by Phase 1; Phase 1 resumes as the primary track once this ships.

## Phase 0 — closed out

Delivered: pnpm monorepo shell (`apps/api`, `apps/workbench`), Postgres + Redis via
`infra/docker-compose.yml`, first `dbmate` migration, GitHub Actions CI, `Makefile` with
`make demo`, and a `/health` endpoint that checks real Postgres/Redis connectivity (not a
stub). Verified locally: typecheck, build, and the `apps/api` vitest suite all pass against a
live stack; `apps/workbench` was booted in dev mode and confirmed to reach `apps/api` over the
network at runtime, not just at build time.

Full task-level record: [`docs/SCAFFOLDING.md`](./SCAFFOLDING.md#phase-0-skeleton-—-done).

## Phase 1 — closed out

Delivered: the `engagements` table plus Kysely types, engagement intake (`POST`/`GET
/engagements` on `apps/api`, enqueues a BullMQ build job), `workers/orchestrator` as a BullMQ
consumer wrapping a real sandbox pipeline, SSE log streaming (`GET /engagements/:id/logs`)
fed by Redis pub/sub from the orchestrator, and the hardened-Docker build sandbox itself:
pinned-commit clone, solc-matrix resolution (read from Foundry's own build cache, not
guessed), two independent hardened builds per run for a determinism check, and artifact
persistence to a Docker named volume (`valence-artifacts` — the local-dev stand-in for the
Railway Volume attached to `workers/orchestrator` in production; deliberately not a host
bind-mount, since Solidity build output can contain case-colliding paths that break on
case-insensitive host filesystems). Every build container runs read-only rootfs, dropped
capabilities, no-new-privileges, an explicit (vendored) seccomp profile, memory/CPU caps, and
a hard wall-clock kill; only the dependency-fetch step gets network, the actual build runs
with `--network none`. Non-Foundry repos get an explicit `not_implemented` status rather than
a fabricated pass.

Verified locally: typecheck and build clean across all five workspace packages; `make test`
passes `apps/api`'s suite (health, engagement intake + job enqueue, SSE log streaming against
a real Redis publish) and `workers/orchestrator`'s suite (a dedicated wall-clock-kill test,
and the phase's acceptance test — a real clone + hardened build + determinism check against
`foundry-rs/forge-template` at a pinned commit, asserting `deterministic: true` and a
non-empty artifact set in the volume); `make demo` runs the same acceptance pipeline standalone
end to end. CI now also runs the orchestrator's Docker-backed suite.

Full task-level record: [`docs/SCAFFOLDING.md`](./SCAFFOLDING.md#phase-1-intake-and-sandbox-—-done).

## Phase 2 — in progress

Delivered so far: the shared-secret middleware auth gate (P2-08) in `apps/workbench`, gating
every route except the `/trial` and `/report/[id]` allowlist; the engagement list view (`/`)
and an engagement detail view with run history and a live SSE-fed log viewer (P2-01, P2-02);
the triage queue list view (`/triage`, P2-03), seeded with 100 synthetic findings generated by
a fixed-seed PRNG (`apps/workbench/lib/findings.ts`) so the set is stable across reloads —
severity is a placeholder 4-level enum, not the real severity model, since that's still an
open decision blocking Phase 3. No promote/demote/merge/severity actions yet (P2-04).

Getting there required a fix Phase 1 left open: `workers/orchestrator`'s pipeline computed a
`PipelineResult` per run but never persisted it anywhere queryable — only an ephemeral BullMQ
job return value. Added a `runs` Postgres table (migration `20260729120000_runs.sql`),
`workers/orchestrator/src/persist-run.ts` to write each run's result after the pipeline
completes, and `GET /engagements` / `GET /engagements/:id/runs` on `apps/api`.

Verified locally: typecheck and build clean across all workspace packages; `apps/api`'s and
`workers/orchestrator`'s suites pass (7 and 3 tests respectively, including two new ones for
run listing and run persistence against a real Postgres). The auth gate and the log viewer were
also exercised manually against live dev servers — confirmed the redirect-to-login on an
unauthenticated request, the public allowlist staying open, the login cookie flow, and a Redis
`PUBLISH` reaching the browser-side `EventSource` as a parsed log line end to end.

Still open: triage actions and interactions (P2-04–07), the self-serve trial flow (P2-10), the
public report page itself (P2-11), and the opt-in mechanism for P2-12 (the *policy* — no
public-by-default — is decided; the toggle isn't built yet).

## Decisions log

Decisions already made — see [`CLAUDE.md`](../CLAUDE.md#decisions-made-do-not-re-litigate-without-cause)
for the full reasoning:

- **Hosting split** (2026-07-28): `apps/workbench` / `apps/portal` / `apps/marketing` →
  Vercel, each its own project. `apps/api`, `workers/*`, Postgres, Redis → Railway, private
  network.
- **Postgres access layer** (2026-07-28): plain SQL migrations (`infra/migrations/`, run via
  `dbmate`) as schema source of truth. TS queries via Kysely, Python via SQLAlchemy
  Core/psycopg. No ORM owns the schema.
- **Sandbox strategy** (2026-07-28): hardened Docker (runc) for Phase 1, not gVisor or
  Firecracker. Ships on Railway with no new infrastructure; explicitly revisit (gVisor first)
  before the first paying engagement runs an adversarial repo through it.
- **Infra footprint constraint** (2026-07-28): Railway, Vercel, and Docker Desktop locally —
  nothing else. No AWS, no Cloudflare. Artifact storage is therefore a **Railway Volume**
  (plain block storage on `workers/orchestrator`), not Cloudflare R2 as originally decided —
  superseded same day. Tradeoff: no presigned-URL downloads; Phase 5's client portal proxies
  file downloads through `apps/api` instead.
- **Phase-checklist scaffolding policy** (2026-07-28): `CLAUDE.md`'s working agreement amended
  — full task-level checklists for all phases (0–9, later 0–11) are now drafted up front in
  `docs/SCAFFOLDING.md` under its own semver scheme, instead of only the active phase having a
  checklist. Supersedes the original "no speculative scaffolding for later phases" rule for
  planning purposes specifically; execution is still strictly one phase at a time.
- **Product-direction update / phase-plan restructuring** (2026-07-28): Artemis, Scout, and Foil
  added as priority phases inside the existing architecture (no app/package rename); a new
  Phase 2 "marketing funnel UI v1" inserted ahead of the analysis battery; phases renumbered
  2–9 → 2–11; old Phase 7 (LLM review pipeline) absorbed into new Phase 6 (Scout). Full
  reasoning and the item-ID remapping table are in `docs/SCAFFOLDING.md`'s v3.0.0 revision-
  history entry.
- **Workbench auth and public-report defaults** (2026-07-29): `apps/workbench` auth is a
  Next.js middleware shared-secret cookie gating every route except an explicit `/trial` +
  `/report/[id]` allowlist, chosen because Vercel's deployment-wide Standard Protection can't
  gate one without blocking the other. Separately, no run is public by default — every run
  starts private, sharing requires an explicit, logged per-run action. Closes both P2-08 and
  the decision blocking P2-12; full reasoning in `docs/SCAFFOLDING.md`'s v3.1.0 revision-
  history entry and `CLAUDE.md`'s "Decisions made" section.
- **Phase order after Phase 2** (2026-07-29): once Phase 2 passes its acceptance test, work
  goes directly to **Phase 7 (Foil v1)** next, ahead of Phase 3 (analysis battery) and Phase 4
  (report generation). Reasoning: with `apps/marketing` now shipped, the stated priority is the
  three product engines — Artemis, Scout, Foil — not further generic pipeline/report
  infrastructure. Foil is the only one of the three with no open blocking decision (Artemis
  needs the engine-architecture call; Scout needs the hosted-LLM/provider-terms call), so it's
  the fastest path to a real shipped product. Phase 3 and 4 are deferred, not cancelled — they
  pick back up once a product engine exists to feed them real findings. Phase 2 itself is not
  paused; its remaining items (P2-03–14) still get finished first, per the working agreement's
  one-phase-at-a-time rule.

## Pending decisions (blocking future phases)

Carried from CLAUDE.md's "Things to raise with Sophie" — listed here against the phase each one
blocks, so the right one gets raised at the right time instead of all at once:

- **The Artemis engine decision** (orchestrate open-source engines vs. fork Certora's Prover
  vs. build a verification-condition generator + solver portfolio) — blocks Phase 5, the
  single biggest architecture call in the new product line.
- **Whether first paying engagements run by hand while the workbench is built** — affects
  phase ordering. Didn't block Phase 1's code and is still open; worth resolving before Phase
  2/3 prioritization decisions get made by default inertia.
- **Severity model** (Code4rena/Sherlock impact×likelihood matrix vs. custom) — blocks Phase 3
  (the canonical finding model needs a severity field shape).
- **Whether to run client code through a hosted LLM, and under what provider terms** — blocks
  Phase 6 (Scout), but the confidentiality implications should be settled well before then.
- **Whether Scout's model calls need a self-hostable path for enterprise clients** — sharper
  version of the question above, matters specifically for the Enterprise pitch.
- **Whether Valence sells to audit firms as a tooling layer** — affects what Phase 4's report
  is optimized for; worth raising before report templates are locked in.
