# BUILD_PLAN.md
> Project: Valence
> Last updated: 2026-07-28

Master phase-by-phase status tracker. The full description of each phase — what it delivers,
its acceptance test — lives in [`CLAUDE.md`](../CLAUDE.md#phase-plan) and is not duplicated
here beyond a one-line summary. This file exists to answer "what's done, what's next, what's
blocked" at a glance. Per the working agreement: **one phase active at a time, no speculative
work on a later phase before the current one's acceptance test passes.**

## Status

| Phase | Name | Status | Acceptance test |
|---|---|---|---|
| 0 | Skeleton | ✅ Done — 2026-07-28 | `docker compose up`, `make demo` green |
| 1 | Intake and sandbox | ▶️ Next | Point it at a real public Foundry repo, get a reproducible build and a stored artifact set |
| 2 | Analysis battery v1 | ⏸ Not started | Run on a repo with known issues produces a deduped finding set; re-running with suppressions applied is quieter |
| 3 | Triage workbench | ⏸ Not started | Triage 100 raw findings down to a working set in under an hour |
| 4 | Report generation | ⏸ Not started | Produce a report on a public repo defensible enough to send a paying client |
| 5 | Client portal and remediation loop | ⏸ Not started | Re-run against a fix commit, diff findings, verify each claimed fix, issue a delta report |
| 6 | Property testing and invariants | ⏸ Not started | Extract invariants for a real protocol, run them, report which hold under fuzzing |
| 7 | LLM review pipeline | ⏸ Not started | On a repo with a known historical exploit, the pipeline proposes it and the gate promotes it on a failing test |
| 8 | CI and continuous mode | ⏸ Not started | GitHub App posts checks per commit, gated against last accepted baseline |
| 9 | Commercial | ⏸ Not started | Multi-tenant orgs, per-engagement pricing/quotas, Stripe, RBAC, access logging |

## Phase 0 — closed out

Delivered: pnpm monorepo shell (`apps/api`, `apps/workbench`), Postgres + Redis via
`infra/docker-compose.yml`, first `dbmate` migration, GitHub Actions CI, `Makefile` with
`make demo`, and a `/health` endpoint that checks real Postgres/Redis connectivity (not a
stub). Verified locally: typecheck, build, and the `apps/api` vitest suite all pass against a
live stack; `apps/workbench` was booted in dev mode and confirmed to reach `apps/api` over the
network at runtime, not just at build time.

Full task-level record: [`docs/SCAFFOLDING.md`](./SCAFFOLDING.md#phase-0-skeleton-—-done).

## Decisions log

Decisions already made — see [`CLAUDE.md`](../CLAUDE.md#decisions-made-do-not-re-litigate-without-cause)
for the full reasoning:

- **Hosting split** (2026-07-28): `apps/workbench` / `apps/portal` → Vercel. `apps/api`,
  `workers/*`, Postgres, Redis → Railway, private network. Artifact storage → Cloudflare R2.
- **Postgres access layer** (2026-07-28): plain SQL migrations (`infra/migrations/`, run via
  `dbmate`) as schema source of truth. TS queries via Kysely, Python via SQLAlchemy
  Core/psycopg. No ORM owns the schema.
- **Sandbox strategy** (2026-07-28): hardened Docker (runc) for Phase 1, not gVisor or
  Firecracker. Ships on Railway with no new infrastructure; explicitly revisit (gVisor first)
  before the first paying engagement runs an adversarial repo through it.

## Pending decisions (blocking future phases)

Carried from CLAUDE.md's "Things to raise with Jeff" — listed here against the phase each one
blocks, so the right one gets raised at the right time instead of all at once:

- **Whether first paying engagements run by hand while the workbench is built** — affects
  phase ordering; should be resolved before or during Phase 1.
- **Severity model** (Code4rena/Sherlock impact×likelihood matrix vs. custom) — blocks Phase 2
  (the canonical finding model needs a severity field shape).
- **Whether to run client code through a hosted LLM, and under what provider terms** — blocks
  Phase 7, but the confidentiality implications should be settled well before then.
- **Whether Valence sells to audit firms as a tooling layer** — affects what Phase 4's report
  is optimized for; worth raising before report templates are locked in.
