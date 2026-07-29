import { notFound } from "next/navigation";
import { getEngagement, listRuns } from "../../../lib/api";
import { LogViewer } from "./log-viewer";

export default async function EngagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const engagement = await getEngagement(id);

  if (!engagement) {
    notFound();
  }

  const runs = await listRuns(id);
  const publicApiUrl = process.env.NEXT_PUBLIC_VALENCE_API_URL ?? "http://localhost:8080";

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>{engagement.repoUrl}</h1>
      <p>
        commit <code>{engagement.commitSha}</code>
      </p>

      <h2>Runs</h2>
      {runs.length === 0 ? (
        <p>No runs yet.</p>
      ) : (
        <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #888" }}>
              <th>Status</th>
              <th>Deterministic</th>
              <th>solc</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{r.status}{r.reason ? ` — ${r.reason}` : ""}</td>
                <td>{r.deterministic === null ? "—" : r.deterministic ? "yes" : "no"}</td>
                <td>{r.solcMatrix.join(", ") || "—"}</td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2>Log stream</h2>
      <LogViewer engagementId={id} apiUrl={publicApiUrl} />
    </main>
  );
}
