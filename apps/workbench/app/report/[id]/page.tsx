export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem" }}>
      <h1>Report</h1>
      <p>The public, shareable report page (P2-11) lands here — not built yet.</p>
      <p>Run id: {id}</p>
    </main>
  );
}
