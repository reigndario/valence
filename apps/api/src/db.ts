import { Pool, types } from "pg";

// OID 1082 = date. Without this, node-postgres parses `date` columns into a JS Date at
// midnight UTC, which shifts to the previous day once serialized back out in a non-UTC
// timezone. Engagement deadlines are calendar dates, not instants, so keep the raw string.
types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
