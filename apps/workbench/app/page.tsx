import Link from "next/link";
import { listEngagements } from "../lib/api";

export default async function Home() {
  const engagements = await listEngagements();

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Valence Workbench</h1>
      <p>
        <Link href="/triage">Triage queue →</Link>
      </p>
      <h2>Engagements</h2>
      {engagements.length === 0 ? (
        <p>No engagements yet.</p>
      ) : (
        <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #888" }}>
              <th>Repo</th>
              <th>Commit</th>
              <th>Created</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {engagements.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #ccc" }}>
                <td>{e.repoUrl}</td>
                <td>{e.commitSha.slice(0, 12)}</td>
                <td>{new Date(e.createdAt).toLocaleString()}</td>
                <td>
                  <Link href={`/engagements/${e.id}`}>view →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
