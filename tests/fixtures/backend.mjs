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

export function createBackendFixture() {
  let scenario = "healthy";
  const requests = [];
  const server = createServer((request, response) => {
    const requestUrl = request.url ?? "/";
    if (request.method === "POST" && requestUrl.startsWith("/scenario/")) {
      scenario = requestUrl.slice("/scenario/".length);
      response.writeHead(204).end();
      return;
    }

    requests.push({
      method: request.method,
      url: requestUrl,
      headers: request.headers,
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

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" }).end(JSON.stringify(body));
}

if (process.env.BACKEND_FIXTURE_LISTEN === "true") {
  const fixture = createBackendFixture();
  fixture.server.listen(4101, "127.0.0.1");
  process.on("SIGTERM", () => fixture.server.close());
  process.on("SIGINT", () => fixture.server.close());
}
