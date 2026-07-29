import { listFindings } from "../../lib/findings";
import type { FindingSeverity } from "../../lib/findings";

const SEVERITY_ORDER: Record<FindingSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export default async function TriagePage() {
  const findings = await listFindings();
  const sorted = [...findings].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Triage Queue</h1>
      <p>{findings.length} findings — synthetic data, seeded until Phase 3 supplies real ones.</p>
      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #888" }}>
            <th>Severity</th>
            <th>Title</th>
            <th>Tool</th>
            <th>Repo</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((f) => (
            <tr key={f.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{f.severity}</td>
              <td>{f.title}</td>
              <td>{f.tool}</td>
              <td>{f.repoLabel}</td>
              <td>
                {f.file}:{f.lineStart}-{f.lineEnd}
              </td>
              <td>{f.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
