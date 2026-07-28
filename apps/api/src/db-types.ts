import type { ColumnType, Generated } from "kysely";

export interface EngagementsTable {
  id: Generated<string>;
  repo_url: string;
  commit_sha: string;
  scope_globs: string[];
  docs_links: string[];
  deadline: ColumnType<string | null, string | null, string | null>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface DB {
  engagements: EngagementsTable;
}
