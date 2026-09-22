import "server-only";
import { SignJWT } from "jose";
import { z } from "zod";
import type { operations } from "./generated/openapi";

const serviceTokenConfigSchema = z.object({
  BACKEND_SERVICE_TOKEN_SECRET: z.string().min(32),
  SERVICE_TOKEN_ISSUER: z.string().min(1),
  SERVICE_TOKEN_AUDIENCE: z.string().min(1),
});

const scopeSchema = z.string().min(1).regex(/^[a-z]+:[a-z]+$/);

export type BackendResolvedSession =
  operations["resolveSession"]["responses"][200]["content"]["application/json"];
export type BackendServiceScope = string;

export class BackendServiceTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BackendServiceTokenError";
  }
}

/**
 * Mints the short-lived credential used only for a single backend operation.
 * The identity must be the result of the BFF's authenticated session lookup;
 * browser input never supplies the user or session identifier.
 */
export async function issueBackendServiceToken(
  session: BackendResolvedSession,
  scope: BackendServiceScope,
): Promise<string> {
  const config = serviceTokenConfig();
  const requestedScope = scopeSchema.safeParse(scope);
  if (!requestedScope.success || !session.allowedScopes.includes(scope)) {
    throw new BackendServiceTokenError("Requested backend scope is not allowed.");
  }

  return new SignJWT({ sid: session.sessionId, scope })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(session.user.id)
    .setIssuer(config.SERVICE_TOKEN_ISSUER)
    .setAudience(config.SERVICE_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(config.BACKEND_SERVICE_TOKEN_SECRET));
}

function serviceTokenConfig() {
  const parsed = serviceTokenConfigSchema.safeParse({
    BACKEND_SERVICE_TOKEN_SECRET: process.env.BACKEND_SERVICE_TOKEN_SECRET,
    SERVICE_TOKEN_ISSUER: process.env.SERVICE_TOKEN_ISSUER,
    SERVICE_TOKEN_AUDIENCE: process.env.SERVICE_TOKEN_AUDIENCE,
  });
  if (!parsed.success) {
    throw new BackendServiceTokenError("Backend service-token configuration is invalid.");
  }
  return parsed.data;
}
