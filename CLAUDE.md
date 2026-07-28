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

Warden (formal verification), Scout (an AI agent that infers intent, writes Warden rules for
it, and separately hunts bugs), and Foil (mutation testing that scores whether those rules
actually catch anything) are the automated engine layer that lives inside that same workbench —
the same three-product shape as Certora's Prover / AutoProver / Gambit lineup, EVM-only for v1.
They are now the priority build target: get one real Warden rule proving, being violated with a
counterexample, and going unknown honestly, ahead of further deepening the static-analysis
battery. They ship as new packages inside the existing monorepo (see Architecture below), not a
rewrite or a separate app — `apps/workbench` stays the single internal surface for audit triage,
Warden runs, Scout sessions, and Foil's mutation dashboard alike.

For Warden/Scout/Foil specifically, the UI is also the marketing funnel, not just an internal
tool, which is a deliberate amendment to "build the internal auditor workbench before the
client portal" above for this product line only. Every non-confidential run gets a permanent,
shareable report URL — a real proof result on a real repo is more convincing than a landing
page, and each public run page is a prospective customer's entry point, the same way Certora's
public verification reports work. Client-engagement work stays private by default under the
confidentiality constraints below; only self-serve trial runs (a prospect's own repo, or a
public repo run as a demo) are shareable, and that has to be an explicit, auditable opt-in, not
a default anyone can flip by accident.

Sophie works  with VS Code, Foundry, Vercel and Railway. Solidity,
Python, TypeScript. Assume crypto and DeFi fluency.

## Working agreement

- Read this file fully before writing code.
- Full task-level checklists exist for every phase (0–11) from day one, versioned in
  `docs/SCAFFOLDING.md` under its own semver scheme — the roadmap is never invisible or
  undocumented. Execution still proceeds one phase at a time: only the active phase's
  checklist gets worked, and no code is written against a future phase before its predecessor's
  acceptance test passes. Drafting a checklist ahead of time is planning, not scaffolding; the
  rule this replaces (2026-07-28) was aimed at the latter.
- Before any decision that is expensive to reverse (schema shape, finding model, sandbox
  strategy, LLM review architecture), stop, give Sophie two or three options with tradeoffs,
  and wait.
- Every phase ends with tests that run and a `make demo` Sophie can execute locally.
- Never fabricate a finding, a severity, or a tool result. If a stage is unimplemented it
  returns `NOT_IMPLEMENTED`, never an empty pass.
- No AWS services and no Cloudflare services, anywhere in the stack. The infra footprint is
  **Railway, Vercel, and Docker Desktop locally — nothing else** unless Sophie explicitly adds
  a fourth. Factor this out of any future option set (managed sandbox providers, storage
  alternatives, etc.) rather than presenting AWS/Cloudflare options at all.
- Prefer fewer dependencies and less new infrastructure over stronger guarantees, when the
  choice is close. This is why hardened Docker beat gVisor/Firecracker/a managed sandbox
  provider for Phase 1's sandbox strategy, and why artifact storage is a Railway Volume
  instead of an object-storage vendor — see below.

## Decisions made (do not re-litigate without cause)

**Hosting split:** `apps/workbench`, `apps/portal`, and `apps/marketing` (all Next.js 15)
deploy to **Vercel**, each as its own Vercel project. Note: Vercel Authentication (Deployment
Protection) is currently **disabled** on the `workbench` Vercel project, by Sophie's explicit
choice, for convenience while there's no application-level auth yet and nothing sensitive
deployed — this makes every deployment, including previews, publicly reachable with no login.
Re-enable (Standard Protection) before any real engagement data ever renders in
`apps/workbench`, per the client confidentiality constraint below. `apps/marketing` is meant
to be public, so this doesn't apply to it. `apps/api`, `workers/orchestrator`,
`workers/analysis`, `workers/review`, Postgres, and Redis all live on **Railway**, on a
private network together. Reasoning: the API and workers are long-running processes (SSE
streaming, queue consumers, container provisioning for sandboxed builds) that don't fit
serverless execution limits and need to reach Postgres/Redis and each other privately.
Frontends are the only pieces that cross a public boundary, calling the API over its public
Railway URL. Final artifact/report storage: a **Railway Volume** (plain block storage)
attached to `workers/orchestrator`, not an object-storage vendor — no S3-compatible service
fit inside the "just Railway, Vercel, Docker Desktop" infra constraint. Tradeoff: no
presigned-URL downloads, so the Phase 8 client portal will need to proxy file downloads
through `apps/api` rather than handing out direct links. Revisit if that proxying becomes a
real bottleneck. This applies to Warden/Scout/Foil artifacts too — counterexamples, call
traces, mutation campaign output, and WSL corpora land on the same Railway Volume, not a new
S3-compatible bucket. Do not reopen this for the new product line; it's the same tradeoff for
the same reason.

**Costs (only two things actually bill so far):** Railway (Postgres + Redis + api + volume,
running continuously — the main bill-driver) and Vercel (the Hobby/free plan's terms exclude
commercial use, so a paid plan is expected once this is a live business tool, not a nice-to-
have). Everything else in the stack today is open-source and free. The largest future cost
isn't infra — it's LLM API calls once Scout (Phase 6) exists (per-chunk model calls plus corpus
embeddings), plus solver/engine compute once Warden (Phase 5) exists, both still open
provider-terms and cost questions below.

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

**Rule status honesty.** Warden and Scout rule results are a four-state enum —
`PROVED`, `VIOLATED`, `UNKNOWN`, `ERROR` — never a boolean. `UNKNOWN` always carries a
machine-readable reason and is never rendered as green in the workbench. Any optimism baked
into a run — a loop bound, an external-call summarization, a bounded rather than exhaustive
check — is recorded on the run and shown on the report; a bounded result is labeled bounded,
never proved. This is "never call the output an audit" applied to formal verification: the
tool must never look more confident than it is.

**Run determinism.** Every Warden and Scout run pins solc, engine, and solver versions plus a
seed, and content-hashes the input tree, so a report is reproducible or the run explicitly
flags drift from a prior one on the same input.

## Architecture

Monorepo, pnpm workspaces plus a Python package for the analysis workers, since the good
Solidity tooling is Python.

```
valence/
  apps/
    workbench/      Next.js 15 App Router. Internal auditor UI: engagements, finding triage
                     queue, report editor, Warden run views, Scout sessions, Foil's mutation
                     dashboard. Build this first. Deploys to Vercel.
    portal/         Client-facing: engagement status, findings, remediation, report download.
                     Phase 8. Deploys to Vercel.
    marketing/      Public landing page — not part of the numbered phase plan, jumped the
                     queue to get a live public surface up sooner. No auth, no data, single
                     page. Deploys to Vercel, own project.
    api/            Fastify + TS. Auth, orgs, engagements, findings, runs, SSE log streaming.
                     Deploys to Railway.
  packages/
    findings/       Canonical finding model, severity calculus, dedup and clustering,
                     suppression rules. Shared everywhere.
    report/         Report as versioned markdown source plus PDF and HTML rendering.
                     Templates per report type.
    sdk/            TS client.
    cli/             `valence` binary for local runs and CI.
    wsl/            Warden Spec Language: lexer, parser, AST, typechecker, formatter.
                     Solidity-adjacent syntax — rules with an environment object, invariants
                     with preserved blocks, a methods block for external-call summarization,
                     ghost variables. LSP server is a later phase.
    wsl-compiler/   WSL AST -> verification IR -> engine harness emission.
    trace/          Counterexample and call trace model, shared by Warden's report UI and
                     Scout's bug-hunting output.
    scout-agent/    Intent inference from code and docs, WSL rule generation from that
                     intent, the separate bug-hunting pass, the retry-on-failure loop that
                     revises a summarization or tightens a bound before surfacing a solver
                     timeout to the auditor.
    foil/           Mutation generator, mutation scoring against the Warden rule suite,
                     survivor report. Live-score protocol for editor integration is a later
                     phase.
  workers/
    orchestrator/   TS. Queue consumer, container provisioning, log streaming, artifact
                     persistence. Deploys to Railway.
    analysis/       Python. One adapter per static-analysis tool, uniform contract in and
                     out. Deploys to Railway.
    engines/        Python. One adapter per verification engine (see the engine decision
                     below), uniform four-state contract, solver pool management (Z3, CVC5,
                     Bitwuzla). Deploys to Railway.
    review/         Python. Scout's retrieval and proposal generation, corpus lookups.
                     Deploys to Railway.
  corpus/           Curated exploit and past-finding corpus for retrieval. Versioned, cited,
                     never client data.
  infra/            Docker runner images per solc version, compose, migrations.
```

Postgres for engagements, runs, findings, suppressions, clients. Redis and BullMQ for the
queue. A Railway Volume for artifacts, logs, and report bundles. SSE for live logs.

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

## Warden — formal verification

Valence's answer to the Certora Prover. A user, or Scout autonomously, writes rules against a
Solidity codebase in WSL (`packages/wsl`). Warden compiles the spec to a verification IR
(`packages/wsl-compiler`), dispatches verification conditions to an engine adapter
(`workers/engines`), and returns a per-rule result: `PROVED`, `VIOLATED` with a concrete
counterexample and full call trace (`packages/trace`), or `UNKNOWN` with a stated reason. Runs
from the CLI, CI, or the workbench; every run gets the permanent, shareable report URL described
above. The counterexample and call-trace UI is meant to be the best thing in the product — most
tools treat it as an afterthought, and it is what makes formal verification usable by someone
who is not a formal-methods researcher.

**The engine decision — raise with Sophie before starting Warden work (Phase 5), do not pick it
alone, per the working agreement above:**

- **Option A, orchestrate open-source engines.** Halmos for EVM symbolic execution, hevm as a
  second opinion, solc SMTChecker as a cheap first pass — the same tools already slated for the
  analysis battery's "bounded symbolic checks" bullet, now driven by WSL rules instead of a
  fixed standard property set. Fastest to a working product; precision ceiling set by engines
  Valence doesn't control.
- **Option B, fork the Certora Prover.** Open source but GPLv3, a real copyleft obligation on a
  hosted commercial product worth a hard look before committing, plus a large JVM codebase
  built over a decade by a research team.
- **Option C, build a verification-condition generator and dispatch straight to a solver
  portfolio** (Z3, CVC5, Bitwuzla). The actual long-term moat; a multi-year effort.

Default absent Sophie's input: Option A for the first several phases, with the
`workers/engines` adapter interface designed so Option C can be introduced later one rule type
at a time — this is exactly the kind of schema/architecture decision the working agreement says
to raise before committing to, since swapping engines later means re-deriving every WSL rule's
harness emission.

## Scout — the AI agent

Formerly framed as "the LLM review stage" — same evidence-gate principle, wider job. Scout
reads a codebase plus whatever design docs or comments exist, infers what the contract is
supposed to do without requiring the user to already know formal methods, converts that
inferred intent into ordinary WSL rules dispatched through Warden — every rule Scout writes
gets the same four-state honesty treatment as a rule a human wrote — and separately runs a
bug-hunting pass that looks for problems the inferred spec didn't anticipate. The report has
three parts: code bugs, design bugs, and full rule status.

Scout is a consumer of Warden, not a replacement for it, and it is allowed to propose, never to
conclude. Chunk by contract and by function with its call graph neighbors, not by token window.
Retrieve against the curated exploit corpus (`corpus/`), tagged by vulnerability class and
protocol type, so a lending protocol pulls lending exploits. For the bug-hunting pass, force the
model to output a structured proposal — vulnerability class, file and line span, preconditions,
impact, a proposed Foundry test that would fail if the proposal is real — then execute that
test. If it fails against the repo, the proposal is a candidate finding and goes to the top of
the triage queue; if it passes, it is demoted to an observation automatically. This gate is what
separates a useful agent from a hallucination generator, and it is why the corpus and the test
executor are worth more engineering than the prompting. Measure and display promotion rate per
run and over time.

Scout's edge over a single LLM pass: when a rule fails or comes back `UNKNOWN`, Scout retries
with a revised summarization or a tighter bound automatically before handing a raw solver
timeout to the auditor, rather than dumping it on them.

## Foil — mutation testing

Valence's answer to Gambit. Foil generates semantic mutants of the source and reruns the WSL
rule suite against each one. A mutant that survives means the spec did not actually test that
code path, which is the only real measure of whether a spec is worth anything. Foil ships a
mutation score per contract and per rule, and a survivor report that names the exact hole. A
live-score channel into an editor, batched rather than firing per keystroke, is real
differentiation over Gambit's batch-only model, but it is explicitly a later phase — Foil v1
(Phase 7) is the campaign runner and dashboard only.

## Phase plan

Each phase is done when its acceptance test passes and `make demo` shows it end to end.

**Phase 0, skeleton.** Done. Monorepo, compose with Postgres and Redis, migrations, CI, health
endpoints.

**Phase 1, intake and sandbox.** Done. Engagement model, repo clone at pinned commit, sandboxed
build across a solc matrix, streamed logs, artifact persistence.

**Phase 2, marketing funnel UI v1 — the current phase, prioritized ahead of further backend
work on purpose.** The workbench shell (engagement/run list, log viewer wired to Phase 1's
streamed logs) plus the full keyboard-driven triage queue interaction set from the old
"triage workbench" phase — promote, demote, merge, set severity, attach span, write narrative —
built now even though it is empty of real findings until Phase 3, because this is where Sophie
will spend working hours and it needs to be fast, not pretty, from the start. Also: the
self-serve trial flow and the permanent, shareable public report URL described in the opening
section. The report page only needs to show what Phase 1 already produces — build
reproducibility, the stored artifact set — that is fine, "this repo builds deterministically,
here is the proof" is a real, defensible result on its own and the funnel does not need
findings yet; Phase 3 fills both the triage queue and the report page in with real data.
Acceptance: point the public trial flow at a real public Foundry repo, get a report URL
reachable with no login, styled with a clear CTA, that Sophie would be comfortable posting
publicly; separately, triage a hundred synthetic findings down to a working set in under an
hour to prove the queue interactions are fast enough once Phase 3 supplies real ones.

**Phase 3, analysis battery v1.** Slither, Aderyn, SMTChecker, forge test and coverage
adapters. Canonical finding model, dedup, clustering, suppression with reasons. Findings now
render in the Phase 2 report page and populate the triage queue. Acceptance: a run on a repo
with known issues produces a deduped finding set, and re-running with suppressions applied
produces a quieter set.

**Phase 4, report generation.** Versioned markdown source, PDF and HTML output, readiness
verdict with named blocker gates, scope statistics, coverage gap section, invariant inventory
section (stub until Warden exists). Acceptance: produce a report on a public repo Sophie would
be willing to send to a paying client.

**Phase 5, Warden v1.** Raise the engine decision above with Sophie first. Compile WSL to the
verification IR, emit a harness, dispatch to the chosen engine, return the four-state result
with a counterexample and call trace, surfaced in the Phase 2 UI and the report. Acceptance: a
correct ERC20 proves, a deliberately broken transferFrom returns `VIOLATED` with a correct call
trace, an unbounded loop returns `UNKNOWN` with a stated reason.

**Phase 6, Scout v1.** Intent inference from code and docs, WSL rule generation from that
intent, the separate bug-hunting pass, the retry-on-failure loop, the three-part report.
Acceptance: point Scout at a real small protocol with no existing spec, it produces a working
rule set plus at least one bug-hunting finding, and on a rule that comes back unknown it
demonstrably retries with a revised approach before surfacing the failure.

**Phase 7, Foil v1.** Mutant generation over the source, campaign runner against the WSL rule
suite, survivor report, mutation score dashboard in the workbench. Acceptance: a vacuous spec
is flagged by a surviving mutant that names the exact hole.

**Phase 8, client portal and remediation loop.** Client sees findings, replies, marks fixed.
Re-run against the fix commit, diff findings, verify each claimed fix, issue a delta report.
The remediation loop is where clients decide whether to come back, so do not treat it as an
afterthought.

**Phase 9, property testing and invariants.** Invariant inventory as a first-class object.
ABI-driven handler generation, Medusa or Echidna campaigns, halmos standard property sets,
complementary to Warden's exhaustive proofs rather than duplicating them — fuzzing catches what
an unbounded WSL rule cannot afford to check exhaustively, and vice versa. Acceptance: extract
invariants for a real protocol, run them, report which hold under fuzzing and which are
unproven.

**Phase 10, CI and continuous mode.** GitHub App posting checks per commit — static-analysis
regressions and Warden/Scout rule regressions against the last accepted baseline alike. This is
the recurring revenue product: a pre-audit is a one-off, continuous monitoring between audits
is a subscription.

**Phase 11, commercial.** Multi-tenant orgs, per-engagement pricing and quotas, Stripe, RBAC,
access logging. Enterprise packaging on top (seats, SSO, VPC/on-prem for teams that will not
send code externally) is a "raise with Sophie" item below, not decided here.

## Things to raise with Sophie rather than decide

- The Warden engine decision above (Option A/B/C) — raise before Phase 5, do not pick it
  unilaterally.
- Whether WSL aims for source compatibility with CVL, which would help adoption but is a real
  legal and design constraint to weigh first.
- Whether Scout's model calls run through a hosted provider or something self-hostable, for
  enterprise clients who will not send code externally — this one matters a lot for that pitch
  specifically, and it is a sharper version of the existing hosted-LLM question below.
- Whether the self-serve trial flow's "public by default for non-client runs" framing (Phase 2)
  is the right default, or whether every public report should require an explicit per-run
  opt-in with no default at all, given how existential the confidentiality constraint is for
  the audit side of the business.
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
