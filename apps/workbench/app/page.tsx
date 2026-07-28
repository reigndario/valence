type ApiHealth =
  | { reachable: true; status: number; body: unknown }
  | { reachable: false; status: null; body: null; error: string };

async function getApiHealth(): Promise<ApiHealth> {
  const apiUrl = process.env.VALENCE_API_URL ?? "http://localhost:8080";

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    return { reachable: true, status: res.status, body: await res.json() };
  } catch (err) {
    return { reachable: false, status: null, body: null, error: (err as Error).message };
  }
}

export default async function Home() {
  const health = await getApiHealth();

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Valence Workbench</h1>
      <p>Phase 0 — this page proves the workbench can reach the api over the network.</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}
