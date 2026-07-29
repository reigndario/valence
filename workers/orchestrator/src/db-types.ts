import type { ColumnType, Generated } from "kysely";

export interface RunAttemptJson {
  attempt: number;
  exitCode: number | null;
  timedOut: boolean;
  artifactPath: string;
  outHash: string | null;
}

export interface RunsTable {
  id: string;
  engagement_id: string;
  status: string;
  reason: string | null;
  solc_matrix: string[];
  deterministic: boolean | null;
  artifact_volume: string;
  // pg doesn't auto-serialize JS values for jsonb columns on the way in — insert/update as a
  // JSON string; select comes back already parsed via pg's built-in jsonb type parser.
  attempts: ColumnType<RunAttemptJson[], string, string>;
  created_at: Generated<Date>;
}

export interface DB {
  runs: RunsTable;
}
