import "server-only";
import { z } from "zod";
import {
  BackendAdapterError,
  BackendHttpError,
  BackendResponseError,
  BackendUnavailableError,
  getBackendBaseUrl,
  type BackendErrorCode,
} from "./adapter";
import type { operations } from "./generated/openapi";

const bffConfigSchema = z.object({
  BFF_AUTH_SECRET: z.string().min(32),
});
const sessionTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);
const loginInputSchema = z
  .object({
    email: z.email().max(320),
    password: z.string().min(12).max(1024),
  })
  .strict();
const userSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    displayName: z.string(),
    role: z.enum(["player", "admin"]),
    emailVerified: z.boolean(),
  })
  .strict();
const resolvedSessionSchema = z
  .object({
    sessionId: z.uuid(),
    user: userSchema,
    allowedScopes: z.array(z.string()),
    idleExpiresAt: z.iso.datetime(),
    absoluteExpiresAt: z.iso.datetime(),
  })
  .strict();
const loginSchema: z.ZodType<BackendLogin> = resolvedSessionSchema
  .extend({ sessionToken: sessionTokenSchema })
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

export type BackendLoginInput =
  operations["login"]["requestBody"]["content"]["application/json"];
export type BackendLogin =
  operations["login"]["responses"][200]["content"]["application/json"];
export type BackendResolvedSession =
  operations["resolveSession"]["responses"][200]["content"]["application/json"];

/**
 * Calls are for a future BFF route only. Login credentials and opaque backend
 * session tokens never become browser-visible state through this adapter.
 */
export async function loginBackend(input: BackendLoginInput): Promise<BackendLogin> {
  const parsed = loginInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new BackendAdapterError("Backend login input is invalid.");
  }
  return postForJson("/v1/auth/login", parsed.data, loginSchema);
}

export async function resolveBackendSession(
  sessionToken: string,
): Promise<BackendResolvedSession> {
  return postForJson(
    "/v1/auth/session",
    { sessionToken: validSessionToken(sessionToken) },
    resolvedSessionSchema,
  );
}

export async function logoutBackendSession(sessionToken: string): Promise<void> {
  const response = await postBackend("/v1/auth/logout", {
    sessionToken: validSessionToken(sessionToken),
  });
  if (response.ok && response.status === 204) return;
  if (!response.ok) throw await httpError(response);
  throw new BackendResponseError();
}

async function postForJson<T>(
  path: string,
  body: object,
  schema: z.ZodType<T>,
): Promise<T> {
  const response = await postBackend(path, body);
  if (!response.ok) throw await httpError(response);
  if (response.status !== 200 || !isJson(response)) {
    throw new BackendResponseError();
  }

  let bodyJson: unknown;
  try {
    bodyJson = await response.json();
  } catch {
    throw new BackendResponseError();
  }
  const parsed = schema.safeParse(bodyJson);
  if (!parsed.success) throw new BackendResponseError();
  return parsed.data;
}

async function postBackend(path: string, body: object): Promise<Response> {
  const bffAuthSecret = bffAuthSecretFromEnvironment();
  try {
    return await fetch(new URL(path, getBackendBaseUrl()), {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${bffAuthSecret}`,
        "Content-Type": "application/json",
        "X-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    if (error instanceof BackendAdapterError) throw error;
    throw new BackendUnavailableError();
  }
}

async function httpError(response: Response): Promise<BackendHttpError> {
  if (!isJson(response)) return new BackendHttpError(response.status);

  try {
    const parsed = errorSchema.safeParse(await response.json());
    return new BackendHttpError(
      response.status,
      parsed.success ? (parsed.data.code as BackendErrorCode) : undefined,
      parsed.success ? parsed.data.correlationId : undefined,
    );
  } catch {
    return new BackendHttpError(response.status);
  }
}

function bffAuthSecretFromEnvironment(): string {
  const parsed = bffConfigSchema.safeParse({
    BFF_AUTH_SECRET: process.env.BFF_AUTH_SECRET,
  });
  if (!parsed.success) {
    throw new BackendAdapterError("BFF authentication configuration is invalid.");
  }
  return parsed.data.BFF_AUTH_SECRET;
}

function validSessionToken(sessionToken: string): string {
  const parsed = sessionTokenSchema.safeParse(sessionToken);
  if (!parsed.success) {
    throw new BackendAdapterError("Backend session token is invalid.");
  }
  return parsed.data;
}

function isJson(response: Response): boolean {
  return response.headers.get("content-type")?.split(";", 1)[0] === "application/json";
}
