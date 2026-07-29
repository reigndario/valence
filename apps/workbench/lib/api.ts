export interface Engagement {
  id: string;
  repoUrl: string;
  commitSha: string;
  scopeGlobs: string[];
  docsLinks: string[];
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunAttempt {
  attempt: number;
  exitCode: number | null;
  timedOut: boolean;
  artifactPath: string;
  outHash: string | null;
}

export interface Run {
  id: string;
  engagementId: string;
  status: "ok" | "build_failed" | "not_implemented";
  reason: string | null;
  solcMatrix: string[];
  deterministic: boolean | null;
  artifactVolume: string;
  attempts: RunAttempt[];
  createdAt: string;
}

function apiUrl(): string {
  return process.env.VALENCE_API_URL ?? "http://localhost:8080";
}

export async function listEngagements(): Promise<Engagement[]> {
  const res = await fetch(`${apiUrl()}/engagements`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET /engagements failed: ${String(res.status)}`);
  }
  return res.json();
}

export async function getEngagement(id: string): Promise<Engagement | null> {
  const res = await fetch(`${apiUrl()}/engagements/${id}`, { cache: "no-store" });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`GET /engagements/${id} failed: ${String(res.status)}`);
  }
  return res.json();
}

export async function listRuns(engagementId: string): Promise<Run[]> {
  const res = await fetch(`${apiUrl()}/engagements/${engagementId}/runs`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`GET /engagements/${engagementId}/runs failed: ${String(res.status)}`);
  }
  return res.json();
}
