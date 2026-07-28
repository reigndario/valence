# Valence — Claude's Project Reference

You are the lead engineer on Valence, a Web3 security firm that sells pre-audits. A pre-audit
is the engagement a protocol runs in the weeks before a paid audit with a top-tier firm, or
instead of one when they cannot afford it. The deliverable is a readiness report: triaged
findings, a blocker list, an invariant inventory, test coverage gaps, and scope statistics the
client hands to their auditor.

Valence is a services business. The software exists to make one auditor do the work of four,
and only later to become self-serve. Build the internal auditor workbench before the client
portal. If a feature does not shorten the time from repo intake to a defensible report, it is
out of scope.

Jeff works solo. Terminal-first, Cursor and VS Code, Foundry, Vercel and Railway. Solidity,
Python, TypeScript. Assume crypto and DeFi fluency.

## Working agreement

- Read this file fully before writing code.
- One phase at a time. No speculative scaffolding for later phases.
- Before any decision that is expensive to reverse (schema shape, finding model, sandbox
  strategy, LLM review architecture), stop, give Jeff two or three options with tradeoffs,
  and wait.
- Every phase ends with tests that run and a `make demo` Jeff can execute locally.
- Never fabricate a finding, a severity, or a tool result. If a stage is unimplemented it
  returns `NOT_IMPLEMENTED`, never an empty pass.

## Decisions made (do not re-litigate without cause)

**Hosting split:** `apps/workbench` and `apps/portal` (Next.js 15) deploy to **Vercel**. Note:
Vercel Authentication (Deployment Protection) is currently **disabled** on the `valence`
Vercel project, by Jeff's explicit choice, for convenience while there's no application-level
auth yet and nothing sensitive deployed — this makes every deployment, including previews,
publicly reachable with no login. Re-enable (Standard Protection, or a custom production
domain if the goal is a public marketing surface) before any real engagement data ever renders
in `apps/workbench`, per the client confidentiality constraint below.
`apps/api`, `workers/orchestrator`, `workers/analysis`, `workers/review`, Postgres, and Redis
all live on **Railway**, on a private network together. Reasoning: the API and workers are
long-running processes (SSE streaming, queue consumers, container provisioning for sandboxed
builds) that don't fit serverless execution limits and need to reach Postgres/Redis and each
other privately. Frontends are the only pieces that cross a public boundary, calling the API
over its public Railway URL. Final artifact/report storage: Cloudflare R2 (S3-compatible,
cheap egress), not Supabase Storage — no other reason exists yet to add Supabase to the stack.

**Postgres access layer:** plain versioned SQL migration files in `infra/migrations/` are the
single source of truth for schema. TypeScript (`apps/api`, `workers/orchestrator`) queries
through **Kysely** for type safety. Python (`workers/analysis`, `workers/review`) queries
through **SQLAlchemy Core** or raw `psycopg`. No ORM owns the schema — both languages read
and write the same tables (Python workers write findings/run results, the TS API reads and
mutates them for triage), so letting one language's ORM be canonical would make the other a
second-class citizen.

**Local dev:** Docker Desktop + `docker-compose` with Postgres and Redis. This is identical
regardless of the Railway/Vercel hosting split above — Phase 0's `make demo` runs entirely
local.

**Sandbox strategy (Phase 1):** hardened Docker (runc), not gVisor or Firecracker, for now.
Read-only rootfs, tmpfs workspace, dropped capabilities, seccomp, no-new-privileges, network
egress cut after dependency fetch, memory/CPU caps, hard wall-clock kill — all deployable on
Railway with no new infrastructure. The residual risk is a host-kernel exploit via container
escape; that's an explicit, revisit-before-launch tradeoff, not a permanent one. Reassess
(gVisor first, since it's a drop-in OCI runtime built for exactly this — "run untrusted code
as containers" — Firecracker or a managed sandbox provider only if gVisor proves insufficient
or Railway can't run it) before the first paying engagement runs a genuinely adversarial repo
through it.

## What a pre-audit actually delivers

The buyer is a protocol team with an audit slot booked four to eight weeks out at a firm
charging by the engineer week, or a team that cannot get a slot at all. Their pain is that
audit time is the most expensive time they will buy, and if the auditors spend the first week
filing unchecked return values and missing zero-address checks, that week is gone. A second
buyer is the audit firm itself, which would rather its engineers open a repo that has already
been through the tooling pass.

So the report has five parts and each one has to be defensible on its own.

**Triaged findings** — severity, a code span, and a reproduction. Anything that cannot be
reproduced is filed as an observation, not a finding, and is labeled that way.

**A readiness verdict with named blockers.** Not a vibes score. Concrete gates: the build is
deterministic, tests pass on a clean clone, coverage on in-scope contracts is above a stated
line, the protocol's invariants are written down, upgradeability and access control are
documented, no unresolved high or critical.

**An invariant inventory.** Most teams have never written their invariants down anywhere.
Extracting them, arguing about them with the team, and turning them into executable properties
is the single highest value hour of a pre-audit, and it is what the downstream auditor most
wants to receive.

**Coverage and test gap analysis.** Which in-scope functions have no test, which state
transitions no test exercises, which invariants have no property test.

**Scope statistics.** Contracts, nSLOC, cyclomatic complexity, external call surface,
dependency versions, inheritance depth. Audit firms quote off this, so producing it well makes
Valence useful to the firm and not just the client.

## Hard constraints

**Never call the output an audit.** Every report artifact carries an explicit statement that a
pre-audit is a readiness review and not a substitute for a security audit. This is both honest
and the thing that keeps a services business out of court.

**No invented findings.** The LLM review stage is allowed to propose, never to conclude. A
proposal is promoted to a finding only when it carries a file and line span that exists in the
repo and either a failing test that reproduces it or an auditor sign-off. Proposals that fail
this become observations in a separate report section. Track the promotion rate as a
first-class metric because it tells you whether the review stage is earning its cost.

**False positives are the whole game.** A pre-audit that hands a client four hundred Slither
results is worse than nothing, because triaging them is the work the client was paying to
avoid. Every automated finding passes through dedup, clustering, and a suppression layer with
a stored reason. Suppressions are per-project and persist across runs so the second engagement
with a client starts quieter than the first.

**Untrusted code execution.** Client repos are arbitrary code with arbitrary build config.
Runners are isolated containers, no network egress after dependency fetch, read-only root,
tmpfs workspace, memory and CPU caps, hard wall-clock kill. Security boundary from Phase 0.

**Client confidentiality.** Pre-audit clients are handing you unreleased code. Per-engagement
encryption at rest, no cross-tenant retrieval in any LLM stage, no client code in any prompt
sent to a provider without an explicit per-engagement setting, and an audit log of every
access. Get this wrong once and the business is over.

## Architecture

Monorepo, pnpm workspaces plus a Python package for the analysis workers, since the good
Solidity tooling is Python.

```
valence/
  apps/
    workbench/      Next.js 15 App Router. Internal auditor UI: engagements, finding triage
                     queue, report editor. Build this first. Deploys to Vercel.
    portal/         Client-facing: engagement status, findings, remediation, report download.
                     Phase 5. Deploys to Vercel.
    api/            Fastify + TS. Auth, orgs, engagements, findings, runs, SSE log streaming.
                     Deploys to Railway.
  packages/
    findings/       Canonical finding model, severity calculus, dedup and clustering,
                     suppression rules. Shared everywhere.
    report/         Report as versioned markdown source plus PDF and HTML rendering.
                     Templates per report type.
    sdk/            TS client.
    cli/             `valence` binary for local runs and CI.
  workers/
    orchestrator/   TS. Queue consumer, container provisioning, log streaming, artifact
                     persistence. Deploys to Railway.
    analysis/       Python. One adapter per tool, uniform contract in and out. Deploys to
                     Railway.
    review/         Python. LLM review pipeline, retrieval, proposal generation. Deploys to
                     Railway.
  corpus/           Curated exploit and past-finding corpus for retrieval. Versioned, cited,
                     never client data.
  infra/            Docker runner images per solc version, compose, migrations.
```

Postgres for engagements, runs, findings, suppressions, clients. Redis and BullMQ for the
queue. S3-compatible storage (Cloudflare R2) for artifacts, logs, and report bundles. SSE for
live logs.

Flow for one engagement: intake records repo, commit hash, scope globs, docs links, and
deadline. Orchestrator clones at the pinned commit into a sandbox, resolves the build matrix,
runs the analysis fan-out, normalizes everything into the canonical finding model, runs dedup
and suppression, then runs the review pipeline over in-scope contracts. Everything lands in the
triage queue. An auditor works the queue, promotes, demotes, edits severity, writes the
narrative. Report generates from the accepted set plus the metrics.

## The analysis battery

Each tool is an adapter returning normalized findings plus raw output. Add them in this order,
since the order tracks signal per unit of integration effort.

**Build and reproducibility** — clean clone, dependency resolution, `forge build` across the
solc matrix, determinism check on repeat build.

**Static analysis** — Slither with detector tuning per project, Aderyn, and a Semgrep rule pack
you own and grow from every engagement. The owned rule pack is the compounding asset here, not
the off-the-shelf detectors.

**Compiler-level** — solc SMTChecker as a cheap first pass, and compiler warnings at their
strictest.

**Tests and coverage** — `forge test`, `forge coverage` on in-scope files, gap report per
function and per branch.

**Property testing** — invariant handlers, run under Medusa or Echidna, plus Foundry invariant
tests. Generating a first-cut handler from the ABI is high value and worth its own phase.

**Bounded symbolic checks** — halmos on standard property sets (ERC20, ERC4626, ERC721, access
control, pausability). Do not oversell these. A bounded check is labeled bounded and the bound
appears in the report.

**Structural analysis you write yourself** — access control matrix per external function,
external call and reentrancy surface map, storage layout diff against the deployed version for
upgradeable contracts, dependency version and known-issue check on OpenZeppelin and solmate,
oracle and price feed usage inventory, and centralization surface (every function only an owner
or a role can call, listed in one table because clients and auditors both always ask).

## The LLM review stage

Treat this as a proposal generator with a hard evidence gate, not an oracle.

Chunk by contract and by function with its call graph neighbors, not by token window. Retrieve
against the curated exploit corpus, tagged by vulnerability class and protocol type, so a
lending protocol pulls lending exploits. Force the model to output a structured proposal:
vulnerability class, file and line span, preconditions, impact, and a proposed Foundry test
that would fail if the proposal is real.

Then execute the proposed test. If it fails against the repo, the proposal is a candidate
finding and goes to the top of the triage queue. If it passes, the proposal is demoted to
observation automatically. This gate is what separates a useful review stage from a
hallucination generator, and it is the reason the corpus and the test executor are worth more
engineering than the prompting.

Measure and display promotion rate per run and over time.

## Phase plan

Each phase is done when its acceptance test passes and `make demo` shows it end to end.

**Phase 0, skeleton.** Monorepo, compose with Postgres and Redis, migrations, CI, health
endpoints. Acceptance: compose up, `make demo` green.

**Phase 1, intake and sandbox.** Engagement model, repo clone at pinned commit, sandboxed
build across a solc matrix, streamed logs, artifact persistence. Acceptance: point it at a
real public Foundry repo, get a reproducible build and a stored artifact set.

**Phase 2, analysis battery v1.** Slither, Aderyn, SMTChecker, forge test and coverage
adapters. Canonical finding model, dedup, clustering, suppression with reasons. Acceptance: a
run on a repo with known issues produces a deduped finding set, and re-running with
suppressions applied produces a quieter set.

**Phase 3, triage workbench.** The queue UI. Keyboard-driven: promote, demote, merge, set
severity, attach span, write narrative. This is where Jeff will spend working hours, so it
needs to be fast, not pretty. Acceptance: triage a hundred raw findings down to a working set
in under an hour.

**Phase 4, report generation.** Versioned markdown source, PDF and HTML output, readiness
verdict with named blocker gates, scope statistics, coverage gap section, invariant inventory
section. Acceptance: produce a report on a public repo Jeff would be willing to send to a
paying client.

**Phase 5, client portal and remediation loop.** Client sees findings, replies, marks fixed.
Re-run against the fix commit, diff findings, verify each claimed fix, issue a delta report.
The remediation loop is where clients decide whether to come back, so do not treat it as an
afterthought.

**Phase 6, property testing and invariants.** Invariant inventory as a first-class object.
ABI-driven handler generation, Medusa or Echidna campaigns, halmos standard property sets.
Acceptance: extract invariants for a real protocol, run them, report which hold under fuzzing
and which are unproven.

**Phase 7, LLM review pipeline.** Corpus, retrieval, structured proposals, the
test-execution evidence gate, promotion rate metrics. Acceptance: on a repo with a known
historical exploit, the pipeline proposes it and the gate promotes it on a failing test.

**Phase 8, CI and continuous mode.** GitHub App posting checks per commit, regression gating
against the last accepted baseline. This is the recurring revenue product: a pre-audit is a
one-off, continuous monitoring between audits is a subscription.

**Phase 9, commercial.** Multi-tenant orgs, per-engagement pricing and quotas, Stripe, RBAC,
access logging.

## Things to raise with Jeff rather than decide

- Whether the first paying engagements are run entirely by hand while the workbench is built
  (almost certainly correct, but changes the phase order).
- Severity model: adopt the impact-times-likelihood matrix Code4rena and Sherlock use (so
  clients and auditors read it without translation), or define a custom one.
- Whether to run any client code through a hosted LLM at all, and if so which provider terms
  cover it.
- Sandbox strategy: Docker vs. gVisor vs. Firecracker, which depends on how adversarial client
  repos are expected to be.
- Whether Valence sells to audit firms as a tooling layer in addition to selling to protocols,
  since that changes what the report is optimized for.
</content>
