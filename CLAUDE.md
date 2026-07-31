# Valence — Claude's Project Reference

Valence is a Web3 security firm that sells pre-audits: the engagement a protocol runs in the
weeks before a paid audit with a top-tier firm, or instead of one when they can't afford it.
Artemis (formal verification), Scout (an AI agent that infers intent, writes rules for it, and
separately hunts bugs), and Foil (mutation testing) are the automated engine layer — same
product shape as Certora's Prover/AutoProver/Gambit, EVM-only for v1, but not derived from
Certora's code. Artemis orchestrates existing open-source engines — Halmos, Kontrol (Runtime
Verification), hevm, and SMTChecker — behind a from-scratch Fletch compiler and harness layer; it
is not a Certora Prover fork. Scout's agent design is based on Kritt AI. Sophie works with
VS Code, Foundry, Vercel, and Railway. Solidity, Python, TypeScript. Assume crypto and DeFi
fluency.

Full business context, architecture, and the phase-by-phase build plan are versioned in
`docs/SCAFFOLDING.md` — this file stays short and points there rather than duplicating it.

## Current work

`apps/marketing` (Next.js 15 App Router, plain CSS, no framework) is now a multi-page site,
rebuilt from its original single static page onto Certora's structural pattern (top nav, hero,
logo/tooling strip, two-pane code/rule panel, feature callouts, comparison cards, footer
mirroring the nav) with Valence's own warm palette instead of Certora's dark one.

**Palette** (`apps/marketing/app/globals.css` custom properties):
- Background `#FAF7F5`, text `#2B2A2E`, card surfaces white with `#E8E1DC` hairline borders, no
  drop shadows.
- Primary accent / buttons: lavender `#C9C2F0`. Success/proved: mint `#B8E0D2`. Warnings: peach
  `#F3C9B2`. Buttons use dark charcoal text on the pastel fill, never white-on-pastel.
- Code panels are the one deliberate contrast point: dark slate `#22242B` with light text.

**Nav:** Artemis, Scout, and Foil are prominent standalone top-level tabs, not grouped under a
"Products" dropdown — each gets its own distinct font (`app/layout.tsx`'s font loads:
IBM Plex Mono / Space Grotesk / Fraunces italic) so each product reads as its own identity.
`$0.99` sits alongside them, unchanged. Everything else lives behind a hamburger menu shown at
every screen width, not just mobile: a Company accordion (About, Security Services — Security
Services' own sub-pages, Audits/Enterprise/Pricing, are linked from the Security Services index
page itself, not the nav) plus a standalone Docs link. No Community tab (removed, along with the
Blog page). Social icons + primary CTA stay visible in the header bar outside the hamburger,
routed to a `/contact` stub — no real signup flow exists yet. Sticky header, compresses with a
border/shadow after ~60px scroll.

**Home page order:** hero (headline + two CTAs, text-only) → tooling strip (Foundry, Slither,
Halmos, Z3 — real pipeline tools, not client logos, since there are no named clients yet) →
code/rule panel (real compiling Solidity `transferFrom` next to the Fletch check for it) →
three feature callouts → two comparison cards (Artemis / Security Audits) → footer.

**Content rules:** no invented clients, testimonials, logos, or certifications. No exclamation
marks, "revolutionize," "cutting-edge," or em dashes. All copy in typed objects under
`apps/marketing/content/`, one file per page, nothing hardcoded in JSX.

**Fletch caveat:** `packages/fletch` has no finalized grammar yet (that's Phase 5, not started). The
code/rule panel is illustrative marketing copy, not a real compiled artifact or run result — no
live status badge, no green "PROVED" checkmark, since nothing actually ran. This is the
rule-status-honesty principle (below) applied to marketing copy.

**Testing:** `vitest` + `@testing-library/react` for nav keyboard/accordion behavior, matching
the convention already used in `apps/api` and `workers/orchestrator`. New devDependency, scoped
to this package.

**Stub-only pages** (header/footer wired, minimal content): Artemis, Scout, Foil, Security
Services index (links to Audits, Enterprise, Pricing), Audits, Enterprise, Pricing, About, Docs,
Contact, Terms, Privacy.

## Decisions made

- **Artemis engine architecture** (resolved): orchestrates Halmos, Kontrol (Runtime
  Verification), hevm, and SMTChecker as the underlying verification engines, behind a
  from-scratch Fletch compiler/IR and harness layer. Not a Certora Prover fork — ruled out over
  GPLv3 copyleft risk — and not a custom verification-condition generator either. Unblocks
  Phase 5 (`P5-01`); full detail in `docs/SCAFFOLDING.md`'s revision history.
- **Scout's agent design** (resolved): based on Kritt AI.
- **Foil**: unchanged from the original mutation-testing scope.
- **Spec language naming** (resolved 2026-07-31): the spec language (formerly **WSL**) is
  renamed **Fletch** — WSL collided with the far more common "Windows Subsystem for Linux."
  `packages/wsl` → `packages/fletch`, `.wsl` → `.fletch`. No scope change.

## Hard constraints (do not relax without Sophie's sign-off)

- **Never call the output an audit.** Every report artifact says pre-audit ≠ security audit.
- **No invented findings.** LLM review proposes, never concludes — a proposal is a finding only
  with a real file/line span and either a failing reproduction test or auditor sign-off.
  Applies in spirit to marketing copy too: no fabricated social proof.
- **Rule status is a 4-state enum** — `PROVED`, `VIOLATED`, `UNKNOWN`, `ERROR` — never a
  boolean, never rendered as green when `UNKNOWN`. A bounded check is labeled bounded, never
  proved.
- **Untrusted client code** runs in isolated containers: read-only root, tmpfs workspace,
  network cut after dependency fetch, memory/CPU caps, hard wall-clock kill.
- **Client confidentiality.** Per-engagement encryption at rest, no cross-tenant retrieval in
  any LLM stage, no client code in a prompt without explicit per-engagement opt-in, audit log
  of every access.
- **No AWS, no Cloudflare, anywhere in the stack.** Infra is Railway + Vercel + Docker Desktop
  locally, nothing else, unless Sophie explicitly adds a fourth.

## Working agreement

- Read this file before writing code; check `docs/SCAFFOLDING.md` before resuming phase work.
- Before any expensive-to-reverse decision (schema shape, finding model, sandbox strategy,
  Scout's hosted-vs-self-hostable model provider), stop and give Sophie two or three options
  with tradeoffs, then wait. The Artemis engine choice was this kind of decision and is now
  resolved (see below) — treat it as settled, not open for re-litigation without Sophie
  reopening it.
- Prefer fewer dependencies and less new infrastructure when the choice is close.
- Never fabricate a finding, a severity, or a tool result. Unimplemented stages return
  `NOT_IMPLEMENTED`, never an empty pass.
</content>
