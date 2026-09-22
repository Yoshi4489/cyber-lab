import { jwtVerify } from "jose";
import { afterEach, describe, expect, it } from "vitest";
import {
  BackendServiceTokenError,
  issueBackendServiceToken,
  type BackendResolvedSession,
} from "../../src/features/backend/service-token";

const originalEnvironment = {
  secret: process.env.BACKEND_SERVICE_TOKEN_SECRET,
  issuer: process.env.SERVICE_TOKEN_ISSUER,
  audience: process.env.SERVICE_TOKEN_AUDIENCE,
};
const secret = "this-is-a-test-only-service-token-secret";
const session = {
  sessionId: "943eced9-5a8e-4160-80c5-ef9021aab53f",
  user: {
    id: "d7c932ea-e0ad-41bb-99e3-b4f9d0971e28",
    email: "learner@example.test",
    displayName: "Learner",
    role: "player",
    emailVerified: true,
  },
  allowedScopes: ["instances:read", "instances:write"],
  idleExpiresAt: "2026-09-22T00:30:00.000Z",
  absoluteExpiresAt: "2026-12-22T00:00:00.000Z",
} satisfies BackendResolvedSession;

afterEach(() => {
  restore("BACKEND_SERVICE_TOKEN_SECRET", originalEnvironment.secret);
  restore("SERVICE_TOKEN_ISSUER", originalEnvironment.issuer);
  restore("SERVICE_TOKEN_AUDIENCE", originalEnvironment.audience);
});

describe("backend service token", () => {
  it("mints a five-minute scoped token from the backend-resolved identity", async () => {
    configure();

    const token = await issueBackendServiceToken(session, "instances:write");
    const { protectedHeader, payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"], issuer: "ciscoku-web", audience: "ciscoku-api" },
    );

    expect(protectedHeader).toMatchObject({ alg: "HS256", typ: "JWT" });
    expect(payload).toMatchObject({
      sub: session.user.id,
      sid: session.sessionId,
      scope: "instances:write",
      iss: "ciscoku-web",
      aud: "ciscoku-api",
    });
    expect(payload.exp).toBeGreaterThanOrEqual((payload.iat ?? 0) + 299);
    expect(payload.exp).toBeLessThanOrEqual((payload.iat ?? 0) + 300);
  });

  it("rejects scopes the resolved session did not grant", async () => {
    configure();

    await expect(issueBackendServiceToken(session, "submissions:write")).rejects.toBeInstanceOf(
      BackendServiceTokenError,
    );
  });

  it("fails closed when service-token configuration is missing", async () => {
    delete process.env.BACKEND_SERVICE_TOKEN_SECRET;
    process.env.SERVICE_TOKEN_ISSUER = "ciscoku-web";
    process.env.SERVICE_TOKEN_AUDIENCE = "ciscoku-api";

    await expect(issueBackendServiceToken(session, "instances:read")).rejects.toBeInstanceOf(
      BackendServiceTokenError,
    );
  });
});

function configure() {
  process.env.BACKEND_SERVICE_TOKEN_SECRET = secret;
  process.env.SERVICE_TOKEN_ISSUER = "ciscoku-web";
  process.env.SERVICE_TOKEN_AUDIENCE = "ciscoku-api";
}

function restore(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
