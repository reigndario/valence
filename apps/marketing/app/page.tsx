export default function Home() {
  return (
    <main>
      <p className="eyebrow">Valence</p>
      <h1>Know what your auditor will find, before they find it.</h1>
      <p className="lede">
        Valence runs pre-audit readiness reviews for Web3 protocols — the weeks before a paid
        audit with a top-tier firm, or instead of one when a slot isn&apos;t affordable. We make
        sure the first week of an expensive audit isn&apos;t spent filing unchecked return
        values and missing zero-address checks.
      </p>
      <a className="cta" href="mailto:hello@valence.dev">
        Get in touch
      </a>

      <section>
        <h2>What you get</h2>
        <ul className="deliverables">
          <li>
            <strong>Triaged findings</strong>
            <span>Severity, a code span, and a reproduction — not a raw tool dump.</span>
          </li>
          <li>
            <strong>A readiness verdict with named blockers</strong>
            <span>
              Concrete gates: deterministic build, passing tests, coverage above a stated line,
              invariants written down, no unresolved high or critical.
            </span>
          </li>
          <li>
            <strong>An invariant inventory</strong>
            <span>The properties your protocol should always hold, written down and argued over.</span>
          </li>
          <li>
            <strong>Coverage and test gap analysis</strong>
            <span>Which functions, state transitions, and invariants have no test.</span>
          </li>
          <li>
            <strong>Scope statistics</strong>
            <span>
              Contracts, nSLOC, cyclomatic complexity, external call surface, dependency
              versions — the numbers your auditor quotes off.
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2>Who it&apos;s for</h2>
        <p className="lede" style={{ marginBottom: 0 }}>
          Protocol teams with an audit slot booked weeks out, and teams that can&apos;t get a
          slot at all. Audit firms who&apos;d rather their engineers open a repo that&apos;s
          already been through the tooling pass.
        </p>
      </section>

      <footer>
        A pre-audit is a readiness review, not a substitute for a security audit.
      </footer>
    </main>
  );
}
