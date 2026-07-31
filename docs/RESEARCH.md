# RESEARCH.md

> §1–6 source: session `00017f3b-c316-4d2d-9ade-a0a878df2d1a`, 2026-07-29 17:21–17:49 UTC. This
> is a reconstructed record of a chat thread that decided the Artemis (then still named Warden)
> engine architecture and Scout's reference tool. It went missing from active context in a later
> session and was recovered by grepping local session logs in `~/.claude/projects/`. Organized by
> topic below, not verbatim transcript order in every place, but nothing is invented — quotes and
> links are pulled directly from the session.
>
> §7 is a separate live web-research pass from 2026-07-30, general market landscape rather than a
> decision record — kept here since it's the natural companion to the engine-choice research
> above, not because anything in it was decided or resolved.
>
> **Note (2026-07-31):** the spec language referred to as "WSL" throughout this record was
> renamed **Fletch** on 2026-07-31 (WSL collided with "Windows Subsystem for Linux"). Left as
> WSL below since this file is a reconstructed record of the session as it actually happened —
> see `docs/SCAFFOLDING.md`'s v3.3.0 revision-history entry for the rename itself.

---

## 1. The question that started it

Sophie asked, mid-way through Phase 5 planning: *"which option is best according to you? Should
we fork Certora's Prover? is Certora's prover really that good?"* — referring to the three-way
`P5-01` engine decision already tracked in `docs/BUILD_PLAN.md`/`docs/SCAFFOLDING.md`:

- **Option A** — orchestrate open-source engines (Halmos, hevm, SMTChecker)
- **Option B** — fork the Certora Prover
- **Option C** — build a custom verification-condition generator + solver portfolio

---

## 2. Round 1: Certora Prover's license and maturity

Web research turned up that Certora Prover had in fact gone open source in 2025, under GPLv3,
as `Certora/CertoraProver` — full engine, not a stripped-down version.

**Sources pulled:**
- [Certora Prover Goes Open Source](https://www.certora.com/blog/certora-goes-open-source)
- [Certora/CertoraProver on GitHub](https://github.com/Certora/CertoraProver)
- [a16z/halmos on GitHub](https://github.com/a16z/halmos)
- [argotorg/hevm on GitHub](https://github.com/argotorg/hevm)

**License check on Option A's tools** (this reversed the assumption baked into the existing
docs, which flagged "GPLv3 copyleft risk" only on Option B):
- Halmos: **AGPL-3.0**
- hevm: **AGPL-3.0**
- SMTChecker (solc): **GPL-3.0**

AGPL's §13 network clause is *stricter* than plain GPLv3 for a hosted SaaS product — it obligates
publishing modified source if you run a modified version as a service, which GPLv3 alone doesn't
require. First-pass conclusion: **Option B (fork Certora) might be the safer license**, not the
riskier one, and Certora is also the most mature/capable tool of the three by a wide margin
(7+ years, $100B+ TVL secured across Aave/MakerDAO/Uniswap/Lido, 70k+ rules written against it).
Initial recommendation was Option B, invoked as a subprocess/CLI rather than linked in-process,
with a flagged caveat that the subprocess-boundary licensing argument needed real legal review.

## 3. The pivot: Sophie rules out forking a competitor

Sophie's response: *"why dont we orchestrate existing open source engines instead of forking
Certora. To be honest i dont want to fork another company's prover."*

This settled it on non-technical grounds that stand on their own regardless of the license
analysis — building the core differentiator on a direct competitor's codebase creates dependency
and optics risk. **Option A confirmed**: orchestrate Halmos, hevm, and SMTChecker.

Correction made to the earlier license framing at this point: the AGPL concern isn't actually a
blocker for Option A either, as long as the tools are invoked as external subprocesses/CLI tools
rather than linked directly into Valence's own Python process — the same "mere aggregation"
boundary argument that applied to Option B. AGPL's network clause bites on *modified* tools run
as a service; using Halmos/hevm/SMTChecker unmodified as external processes doesn't create new
disclosure obligations for `workers/engines` or `wsl-compiler`. Still worth real legal review
before `P5-08`, but not a reason to reconsider Option A.

The acknowledged cost of Option A vs. a single mature engine: reconciling three tools with
different scopes and bound semantics (SMTChecker's compiler-level checks, Halmos's Python-based
bounded symbolic testing, hevm's Haskell-based symbolic execution) into one coherent four-state
result and dispatch/fallback order — real engineering work, but tractable, and arguably more
honest than a single opaque engine's pass/fail (a natural fallback chain: SMTChecker first, then
Halmos, then hevm, `UNKNOWN` with a stated reason if none resolve it).

## 4. Round 2: what else is out there

Sophie: *"what else is out there open source i mean. i know Certic recently launched their open
source tool and then Kritt AI released Open-Kritt."*

**"Certic" didn't turn up** — almost certainly meant CertiK, which is a different category
entirely: a commercial audit firm/platform (proprietary AI + manual review service), not an
open-source engine. Not a `P5-01` candidate.

**Kritt AI / open-kritt is real.**
- [Kritt-ai/open-kritt on GitHub](https://github.com/Kritt-ai/open-kritt)
- License: AGPL-3.0, self-hosted
- What it does: orchestrates AI agents (via Codex, Claude Code, or other providers) to
  decompose a codebase into focused security review tasks ("playbooks"), runs them in parallel,
  each in a disposable Docker container, executing tools/compiling/testing/building PoCs, then
  de-duplicates and ranks results into a single findings schema on a dashboard.
- It's an **LLM-driven vulnerability hunter, not a formal-verification engine** — same category
  as **Scout**, not Artemis. Not a `P5-01` candidate; relevant to Phase 6 instead.
- Maturity at time of research: 448 stars, 91 forks, ~22 commits. Team claims $1.5M+ in
  bug-bounty earnings under the handle "Blockian" — their own claim, not independently verified.
- **One real caution flagged**: open-kritt's agents run **as root, with a writable copy of the
  repo, and internet access** inside the container — close to the opposite of Valence's own
  hard constraint (read-only root, tmpfs workspace, network cut after dependency fetch,
  memory/CPU caps, hard wall-clock kill). Their sandbox model assumes public/arbitrary repos
  where a leak isn't a client-confidentiality problem; Valence's assumes the opposite. Useful as
  a reference for the orchestration/evidence-gate pattern (their PoC-validation step lines up
  with Scout's planned `P6-10` evidence gate, and the parallel-task-decomposition pattern is a
  reasonable reference point for `P6-04`/`P6-05` retrieval and chunking) — not something to
  adopt wholesale.

**Kontrol — the one nobody had raised yet, and it changed the final shape of the decision.**
- [runtimeverification/kontrol on GitHub](https://github.com/runtimeverification/kontrol)
- [Kontrol docs](https://docs.runtimeverification.com/kontrol)
- From Runtime Verification Inc., built on KEVM (a formal K-framework semantics of the EVM),
  integrates directly with Foundry — existing Foundry tests can double as formal specs.
- License: **BSD-3-Clause** — fully permissive, no copyleft at all, cleaner than every other
  option discussed including Certora's GPLv3.
- Runtime Verification has been doing formal-methods work for over a decade; not a fresh launch.
- Fits Valence's stack directly — `CLAUDE.md` already lists Foundry as core to Sophie's
  workflow, and the marketing site's tooling strip already namechecks Halmos and Z3.

**Other sources pulled during this round** (general landscape scan, not all directly cited in
the final decision):
- [QuillAudits — Top 10 Smart Contract Security Tools 2026](https://www.quillaudits.com/blog/smart-contract/smart-contract-security-tools-guide)
- [Cyfrin — industry-leading smart contract auditing tools](https://www.cyfrin.io/blog/industry-leading-smart-contract-auditing-and-security-tools)
- [Hacken — audit tools review](https://hacken.io/discover/audit-tools-review/)

Sophie's call: *"when Scout starts the build yes we should look into Kritt ai. and yes we should
include Runtime Verification kontrol into option A."*

## 5. Final architecture, confirmed

Sophie asked directly: *"Is Warden a mix between SMTchecker, Halmos, hevm, and Kontrol? Can
Warden be one product that covers all these tools? so 4 in 1?"*

Confirmed: yes. **Warden (later renamed Artemis) is the single product; SMTChecker, Halmos,
hevm, and Kontrol are invisible backend engines it dispatches to.** A user never touches any of
the four tools directly. The mechanism, per the already-scoped Phase 5 plan:

1. **WSL** (`packages/wsl`) — Valence's own spec language, not any underlying tool's syntax.
2. **`packages/wsl-compiler`** — WSL AST → a generic, engine-agnostic verification IR that
   doesn't commit to a specific backend.
3. **Harness emission** — translates the IR into whatever format each engine needs (a Foundry
   test file for Kontrol/Halmos/hevm, a Solidity annotation for SMTChecker) — four small
   translators, one per engine.
4. **`workers/engines`** dispatches the rule to the appropriate engine(s), runs it, normalizes
   the result into the single four-state result: `PROVED` / `VIOLATED` / `UNKNOWN` / `ERROR`.

Dispatch order proposed as cheapest-first: SMTChecker (already runs at compile time, essentially
free) → Kontrol (Foundry-native, general-purpose) → Halmos (bounded symbolic testing) → hevm
(lower-level symbolic execution/equivalence checking), falling through and returning `UNKNOWN`
with a stated reason if none resolve it within bounds.

**The one caveat that has to be built in, not bolted on later:** the four engines are not
equally capable of a genuine `PROVED`. Halmos and hevm's symbolic execution is fundamentally
*bounded* (loop-unrolling limits, calldata bounds) unless a rule happens to reduce to something
provably complete within that bound; SMTChecker and Kontrol can produce real unbounded proofs
for supported properties. Per Valence's own hard constraint — *"a bounded check is labeled
bounded, never proved"* — the normalization layer (`P5-08`'s "uniform four-state contract") has
to know, per engine and per rule shape, whether a result is an unconditional proof or a bounded
check, and label it honestly. Skipping this is exactly the overclaiming failure mode the
rule-status-honesty principle exists to prevent.

## 6. What this thread resolved, in one place

- **`P5-01` (Artemis engine decision): resolved.** Option A — orchestrate Halmos, Kontrol
  (Runtime Verification), hevm, and SMTChecker behind a from-scratch WSL compiler/IR and harness
  layer. Not a Certora Prover fork (competitive-dependency risk, Sophie's call, independent of
  the license analysis). Not a custom VC generator (Option C was never seriously in contention
  once Option A had four viable engines).
- **Scout reference tool: Kritt AI / open-kritt**, flagged as prior art for Phase 6
  (`P6-04`–`P6-10`), specifically the evidence-gate and parallel-task-decomposition patterns —
  explicitly *not* to be adopted wholesale given its root/writable/networked sandbox model, which
  is the opposite of Valence's confidentiality constraints.
- **Foil**: not discussed in this thread — unchanged.
- **Immediately after this thread**: Sophie asked for the Warden → Artemis rename across the
  codebase and site (`docs/SCAFFOLDING.md` v3.1.1), and separately, the phase-order note ("go
  straight to Phase 7/Foil after Phase 2") was flagged as stale now that Phase 5 was unblocked —
  Phase 5 (Artemis) is the real next phase once Phase 2 finishes, not Phase 7.

This decision is mirrored, in summary form, in `CLAUDE.md`'s "Decisions made" section and
`docs/SCAFFOLDING.md`'s v3.2.0 revision-history entry. This file is the fuller record of *how*
the conclusion was reached, kept for the reasoning and links, not as the canonical status source
— `docs/SCAFFOLDING.md` and `docs/BUILD_PLAN.md` remain canonical for current phase status.

---

## 7. Market-Landscape Context: what security firms actually use

Live web research, 2026-07-30. Scoped question: what are the most common tools for smart
contract security/auditing in Web3, what does the majority of security firms actually run, and
what does each tool do. General landscape context for where Artemis/Scout/Foil sit relative to
the existing toolchain — not a decision record, nothing here is a `P{n}-{seq}` blocker.

### Static analysis (first pass, catches the obvious stuff fast)
- **Slither** (Trail of Bits) — the de facto industry standard. Parses the Solidity AST without
  executing code, runs 80–90+ built-in detectors (reentrancy, uninitialized storage, unchecked
  returns, access control). Nearly every firm runs this before anything else.
- **Aderyn** — a newer Rust-based static analyzer, gained real adoption since its 2024 release,
  positioned as a faster/modern Slither alternative.

### Symbolic execution (explores execution paths for edge cases)
- **Mythril / MythX** (ConsenSys) — walks possible execution paths symbolically to find
  reentrancy, overflow, unreachable code. MythX is the hosted/cloud version, sometimes offered
  as fuzzing-as-a-service.

### Fuzzing / property-based testing (auditor-written invariants, tool tries to break them)
- **Echidna** (Trail of Bits) — the standard property-based fuzzer. Auditor writes invariants as
  Solidity functions; it generates random call sequences trying to falsify them.
- **Medusa** — a newer Go-based fuzzer inspired by Echidna, adds parallel fuzzing and multiple
  simultaneous strategies for speed.
- **Foundry's built-in fuzzer/invariant testing** — increasingly where this work happens
  directly in the same framework devs already write tests in, rather than a separate tool.

### Formal verification (mathematical proofs, not just "didn't find a counterexample")
- **Certora Prover** — the dominant name here; proves properties hold for *all* inputs via CVL
  specs, not just random sampling. Widely used at very-high-TVL protocols (Aave, MakerDAO,
  etc.) — this is the one Artemis is positioned against, per §2–3 above.
- **Halmos, Kontrol, hevm, SMTChecker** — the four engines behind Artemis (§5–6 above), all
  narrower/more specialized than Certora individually but open source.

### Dev/test frameworks (not audit tools per se, but where audits actually happen)
- **Foundry** — now the dominant framework for writing, running, and fuzzing tests; most tools
  above either integrate with it directly (Kontrol, Halmos) or run alongside it.
- **Hardhat** — still used, more so on JS/TS-heavy teams.

### Monitoring (post-deployment, not pre-audit)
- **Forta, Hypernative** — continuous on-chain monitoring, subscription-priced ($500–$10k+/mo),
  watching deployed contracts for exploit patterns in real time.

### AI-assisted (the newest category, where Scout competes)
- **Sherlock AI** — described as current state of the art for AI-assisted auditing, trained on
  real audit data/methodology.
- Broader trend: AI tools now doing first-pass triage across tens of thousands of contracts
  monthly, with firms converging on a **hybrid model** — AI for breadth/speed, human experts for
  depth/judgment on what AI flags. AI-augmented engagements from specialist firms run roughly
  $15k–$60k depending on complexity.

### The actual pattern at real firms
No firm uses one tool. Trail of Bits runs Slither + Echidna. ConsenSys Diligence runs
Mythril/MythX. The near-universal workflow: **run 2–4 automated tools first (usually Slither +
a fuzzer + Foundry tests), fix what's cheap to fix, then pay for manual review** — automation
narrows the search space, humans do judgment calls. This is the same shape Valence's own
pre-audit pitch is built around, and it's also the precedent for why a 4-in-1 orchestrator
(Artemis) is a reasonable idea — teams are already stacking multiple tools by hand; Artemis
formalizes that instead of inventing a new pattern.

**Sources:**
- [Smart Contract Auditing Tools 2026: A Reviewer's Stack — Hacken](https://hacken.io/discover/audit-tools-review/)
- [Top 10 Smart Contract Security Tools in 2026 — QuillAudits](https://www.quillaudits.com/blog/smart-contract/smart-contract-security-tools-guide)
- [Essential Tools for Auditing Solidity Smart Contracts — Medium](https://medium.com/@dehvcurtis/essential-tools-for-auditing-solidity-smart-contracts-a-practical-guide-4a6b5e1b5709)
- [Top Security Tools for Smart Contract Auditing in 2026 — Nadcab](https://www.nadcab.com/blog/security-tools-for-smart-contract-auditing)
- [Your Guide to Smart Contract Fuzzing in 2026 — QuillAudits](https://www.quillaudits.com/blog/smart-contract/smart-contract-fuzzing)
- [Effective, Usable and Fast: Echidna — ImmuneBytes](https://immunebytes.com/blog/effective-usable-and-fast-echidna-a-smart-contract-fuzzing-tool/)
- [Top 10 Smart Contract Audit Tools in 2026 — Nomos Labs](https://nomoslabs.io/blog/top-10-smart-contract-audit-tools-2026-full-guide)
- [Mainstream Adoption of AI in Smart Contract Auditing 2026 — Nadcab](https://www.nadcab.com/blog/ai-in-smart-contract-auditing-explained)
- [AI-Assisted Smart Contract Auditing: Tools, Workflows, and Limits — Smart Contract Hacking](https://smartcontractshacking.com/learn/security/ai-assisted-smart-contract-auditing)
