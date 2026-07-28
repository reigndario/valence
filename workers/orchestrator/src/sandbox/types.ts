export type LogSink = (line: string, stream: "stdout" | "stderr") => void;

export interface PipelineInput {
  engagementId: string;
  repoUrl: string;
  commitSha: string;
  onLog?: LogSink;
}

export interface BuildAttempt {
  attempt: number;
  exitCode: number | null;
  timedOut: boolean;
  // Path within the artifact volume (see PipelineResult.artifactVolume), not a host path.
  artifactPath: string;
  outHash: string | null;
}

export type PipelineStatus = "ok" | "build_failed" | "not_implemented";

export interface PipelineResult {
  status: PipelineStatus;
  reason?: string;
  engagementId: string;
  runId: string;
  repoUrl: string;
  commitSha: string;
  solcMatrix: string[];
  attempts: BuildAttempt[];
  deterministic: boolean | null;
  artifactVolume: string;
}
