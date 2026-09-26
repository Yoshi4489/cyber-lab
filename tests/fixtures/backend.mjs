// Loopback-only test double; no lab runtime or credentials are involved.
import { createServer } from "node:http";

const correlationId = "d48b142b-4929-44e9-8ac5-153771f475a4";
const challenge = {
  id: "f5d66313-2997-45af-94d7-8bcad4d9fd4f",
  slug: "intro-web",
  title: "Intro Web",
  summary: "A loopback-only catalog fixture.",
  category: "web",
  difficulty: "easy",
  points: 100,
  kind: "web",
  tags: ["http", "intro"],
};

export function createBackendFixture({ bffAuthSecret = "" } = {}) {
  let scenario = "healthy";
  const requests = [];
  const server = createServer(async (request, response) => {
    const requestUrl = request.url ?? "/";
    if (request.method === "POST" && requestUrl.startsWith("/scenario/")) {
      scenario = requestUrl.slice("/scenario/".length);
      response.writeHead(204).end();
      return;
    }

    const body = await readRequestBody(request);
    requests.push({
      method: request.method,
      url: requestUrl,
      headers: request.headers,
      body,
    });

    if (scenario === "redirect") {
      response.writeHead(302, { Location: "/redirected" }).end();
      return;
    }
    if (scenario === "non-json") {
      response.writeHead(200, { "Content-Type": "text/plain" }).end("not json");
      return;
    }
    if (scenario === "error") {
      sendJson(response, 429, {
        code: "RATE_LIMITED",
        message: "Try again later.",
        correlationId,
      });
      return;
    }
    if (scenario === "invalid-error") {
      sendJson(response, 503, { internal: "Do not expose this upstream body" });
      return;
    }
    if (scenario === "invalid") {
      sendJson(response, 200, { unexpected: true });
      return;
    }

    if (request.method === "POST" && requestUrl.startsWith("/v1/auth/")) {
      if (request.headers.authorization !== `Bearer ${bffAuthSecret}`) {
        sendJson(response, 401, {
          code: "UNAUTHORIZED",
          message: "Invalid BFF credential.",
          correlationId,
        });
        return;
      }
      if (requestUrl === "/v1/auth/login") {
        sendJson(response, 200, { ...resolvedSession, sessionToken });
        return;
      }
      if (requestUrl === "/v1/auth/session") {
        sendJson(response, 200, resolvedSession);
        return;
      }
      if (requestUrl === "/v1/auth/logout") {
        response.writeHead(204).end();
        return;
      }
    }

    if (requestUrl === "/healthz") {
      sendJson(response, 200, { status: "ok" });
      return;
    }
    if (requestUrl === "/v1/categories") {
      sendJson(response, 200, { categories: ["web", "crypto"] });
      return;
    }
    if (requestUrl === "/v1/challenges") {
      sendJson(response, 200, { challenges: [challenge], source: "database" });
      return;
    }
    if (requestUrl.startsWith("/v1/challenges/")) {
      if (requestUrl === "/v1/challenges/missing") {
        sendJson(response, 404, {
          code: "NOT_FOUND",
          message: "Challenge not found.",
          correlationId,
        });
      } else {
        sendJson(response, 200, challenge);
      }
      return;
    }
    if (requestUrl === "/v1/leaderboard") {
      sendJson(response, 200, {
        entries: [
          {
            rank: 1,
            displayName: "Loopback Learner",
            totalPoints: 100,
            solvedCount: 1,
            lastSolvedAt: "2026-09-22T00:00:00.000Z",
          },
        ],
        source: "database",
      });
      return;
    }

    response.writeHead(404).end();
  });

  return {
    server,
    setScenario(nextScenario) {
      scenario = nextScenario;
    },
    requests() {
      return [...requests];
    },
  };
}

const sessionToken = "A".repeat(43);
const resolvedSession = {
  sessionId: "943eced9-5a8e-4160-80c5-ef9021aab53f",
  user: {
    id: "d7c932ea-e0ad-41bb-99e3-b4f9d0971e28",
    email: "learner@example.test",
    displayName: "Loopback Learner",
    role: "player",
    emailVerified: true,
  },
  allowedScopes: ["instances:read", "instances:write"],
  idleExpiresAt: "2026-09-22T00:30:00.000Z",
  absoluteExpiresAt: "2026-12-22T00:00:00.000Z",
};

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
}

if (process.env.BACKEND_FIXTURE_LISTEN === "true") {
  const fixture = createBackendFixture();
  fixture.server.listen(4101, "127.0.0.1");
  process.on("SIGTERM", () => fixture.server.close());
  process.on("SIGINT", () => fixture.server.close());
}
