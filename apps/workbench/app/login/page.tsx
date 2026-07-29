export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main style={{ fontFamily: "monospace", padding: "2rem", maxWidth: "24rem" }}>
      <h1>Valence Workbench</h1>
      <p>This is the internal workbench. Enter the shared secret to continue.</p>
      {error ? <p style={{ color: "crimson" }}>Incorrect secret.</p> : null}
      <form method="POST" action="/api/login">
        <input type="hidden" name="next" value={next ?? "/"} />
        <label htmlFor="secret">Secret</label>
        <br />
        <input id="secret" name="secret" type="password" autoFocus style={{ width: "100%" }} />
        <br />
        <br />
        <button type="submit">Enter</button>
      </form>
    </main>
  );
}
