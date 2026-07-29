import type { FastifyInstance } from "fastify";
import { db } from "./kysely.js";
import { buildQueue } from "./queue.js";

interface CreateEngagementBody {
  repoUrl?: unknown;
  commitSha?: unknown;
  scopeGlobs?: unknown;
  docsLinks?: unknown;
  deadline?: unknown;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function toEngagementDTO(row: {
  id: string;
  repo_url: string;
  commit_sha: string;
  scope_globs: string[];
  docs_links: string[];
  deadline: string | null;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    id: row.id,
    repoUrl: row.repo_url,
    commitSha: row.commit_sha,
    scopeGlobs: row.scope_globs,
    docsLinks: row.docs_links,
    deadline: row.deadline,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function registerEngagementRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateEngagementBody }>("/engagements", async (req, reply) => {
    const body = req.body ?? {};

    if (!isNonEmptyString(body.repoUrl) || !isNonEmptyString(body.commitSha)) {
      reply.code(400);
      return { error: "repoUrl and commitSha are required strings" };
    }

    if (body.scopeGlobs !== undefined && !isStringArray(body.scopeGlobs)) {
      reply.code(400);
      return { error: "scopeGlobs must be an array of strings" };
    }

    if (body.docsLinks !== undefined && !isStringArray(body.docsLinks)) {
      reply.code(400);
      return { error: "docsLinks must be an array of strings" };
    }

    if (body.deadline !== undefined && body.deadline !== null && typeof body.deadline !== "string") {
      reply.code(400);
      return { error: "deadline must be an ISO date string or null" };
    }

    const row = await db
      .insertInto("engagements")
      .values({
        repo_url: body.repoUrl,
        commit_sha: body.commitSha,
        scope_globs: isStringArray(body.scopeGlobs) ? body.scopeGlobs : [],
        docs_links: isStringArray(body.docsLinks) ? body.docsLinks : [],
        deadline: (body.deadline as string | null | undefined) ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await buildQueue.add("run-build", {
      engagementId: row.id,
      repoUrl: row.repo_url,
      commitSha: row.commit_sha,
    });

    reply.code(201);
    return toEngagementDTO(row);
  });

  app.get("/engagements", async () => {
    const rows = await db
      .selectFrom("engagements")
      .selectAll()
      .orderBy("created_at", "desc")
      .execute();

    return rows.map(toEngagementDTO);
  });

  app.get<{ Params: { id: string } }>("/engagements/:id", async (req, reply) => {
    const row = await db
      .selectFrom("engagements")
      .selectAll()
      .where("id", "=", req.params.id)
      .executeTakeFirst();

    if (!row) {
      reply.code(404);
      return { error: "engagement not found" };
    }

    return toEngagementDTO(row);
  });
}
