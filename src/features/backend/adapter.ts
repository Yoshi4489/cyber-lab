import "server-only";
import { z } from "zod";
import type { operations } from "./generated/openapi";

export type BackendLiveness =
  operations["getLiveness"]["responses"][200]["content"]["application/json"];
export type BackendCategories =
  operations["listCategories"]["responses"][200]["content"]["application/json"];
export type BackendChallenge =
  operations["listChallenges"]["responses"][200]["content"]["application/json"]["challenges"][number];
export type BackendChallenges =
  operations["listChallenges"]["responses"][200]["content"]["application/json"];
export type BackendLeaderboard =
  operations["getLeaderboard"]["responses"][200]["content"]["application/json"];
export type BackendErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "NOT_IMPLEMENTED"
  | "INTERNAL_ERROR";

const healthSchema: z.ZodType<BackendLiveness> = z
  .object({ status: z.literal("ok") })
  .strict();
const categoriesSchema: z.ZodType<BackendCategories> = z
  .object({ categories: z.array(z.string()) })
  .strict();
const challengeSchema: z.ZodType<BackendChallenge> = z
  .object({
    id: z.uuid(),
    slug: z.string(),
    title: z.string(),
    summary: z.string(),
    category: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    points: z.number().int().nonnegative(),
    kind: z.enum(["web", "shell"]),
    tags: z.array(z.string()),
  })
  .strict();
const challengesSchema: z.ZodType<BackendChallenges> = z
  .object({
    challenges: z.array(challengeSchema),
    source: z.literal("database"),
  })
  .strict();
const leaderboardSchema: z.ZodType<BackendLeaderboard> = z
  .object({
    entries: z.array(
      z
        .object({
          rank: z.number().int().positive(),
          displayName: z.string(),
          totalPoints: z.number().int().nonnegative(),
          solvedCount: z.number().int().nonnegative(),
          lastSolvedAt: z.iso.datetime().nullable(),
        })
        .strict(),
    ),
    source: z.literal("database"),
  })
  .strict();
const errorSchema = z
  .object({
    code: z.enum([
      "UNAUTHORIZED",
      "FORBIDDEN",
      "NOT_FOUND",
      "CONFLICT",
      "INVALID_REQUEST",
      "RATE_LIMITED",
      "NOT_IMPLEMENTED",
      "INTERNAL_ERROR",
    ]),
    message: z.string(),
    correlationId: z.uuid(),
  })
  .strict();

export type BackendStatus = "not-configured" | "reachable" | "unavailable";

export class BackendAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendAdapterError";
  }
}

export class BackendHttpError extends BackendAdapterError {
  constructor(
    readonly status: number,
    readonly code?: BackendErrorCode,
    readonly correlationId?: string,
  ) {
    super(`Backend request failed with HTTP ${status}.`);
    this.name = "BackendHttpError";
  }
}

export class BackendResponseError extends BackendAdapterError {
  constructor() {
    super("Backend response did not match the API contract.");
    this.name = "BackendResponseError";
  }
}

export class BackendUnavailableError extends BackendAdapterError {
  constructor() {
    super("Backend API is unavailable.");
    this.name = "BackendUnavailableError";
  }
}

// Fixed path and deployment-owned origin: no user-controlled proxy destination.
export async function getBackendStatus(): Promise<BackendStatus> {
  if (!process.env.BACKEND_URL) return "not-configured";
  try {
    await getBackendLiveness();
    return "reachable";
  } catch {
    return "unavailable";
  }
}

export function getBackendLiveness(): Promise<BackendLiveness> {
  return getJson("/healthz", healthSchema);
}

export function listBackendCategories(): Promise<BackendCategories> {
  return getJson("/v1/categories", categoriesSchema);
}

export function listBackendChallenges(): Promise<BackendChallenges> {
  return getJson("/v1/challenges", challengesSchema);
}

export function getBackendChallenge(slug: string): Promise<BackendChallenge> {
  return getJson(`/v1/challenges/${encodeURIComponent(slug)}`, challengeSchema);
}

export function getBackendLeaderboard(): Promise<BackendLeaderboard> {
  return getJson("/v1/leaderboard", leaderboardSchema);
}

async function getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const response = await requestBackend(path);
  if (!isJson(response)) throw new BackendResponseError();

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new BackendResponseError();
  }

  if (!response.ok) {
    const error = errorSchema.safeParse(body);
    throw new BackendHttpError(
      response.status,
      error.success ? error.data.code : undefined,
      error.success ? error.data.correlationId : undefined,
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new BackendResponseError();
  return parsed.data;
}

async function requestBackend(path: string): Promise<Response> {
  const base = getBackendBaseUrl();
  try {
    return await fetch(new URL(path, base), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "X-Request-Id": crypto.randomUUID(),
      },
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    throw new BackendUnavailableError();
  }
}

export function getBackendBaseUrl(): URL {
  const configured = process.env.BACKEND_URL;
  if (!configured) {
    throw new BackendAdapterError("BACKEND_URL is not configured.");
  }

  let base: URL;
  try {
    base = new URL(configured);
  } catch {
    throw new BackendAdapterError("BACKEND_URL must be an absolute HTTP(S) URL.");
  }

  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash ||
    !["", "/"].includes(base.pathname)
  ) {
    throw new BackendAdapterError(
      "BACKEND_URL must be a credential-free API origin.",
    );
  }

  const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (
    process.env.NODE_ENV === "production" &&
    base.protocol !== "https:" &&
    !loopbackHosts.has(base.hostname)
  ) {
    throw new BackendAdapterError(
      "Production BACKEND_URL must use HTTPS outside loopback.",
    );
  }

  return base;
}

function isJson(response: Response): boolean {
  return response.headers.get("content-type")?.split(";", 1)[0] === "application/json";
}
