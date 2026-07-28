import { Kysely, PostgresDialect } from "kysely";
import type { DB } from "./db-types.js";
import { pool } from "./db.js";

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({ pool }),
});
