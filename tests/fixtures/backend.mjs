// Loopback-only test double; no lab runtime or credentials are involved.
import { createServer } from "node:http";

let scenario = "healthy";
const server = createServer(async (request, response) => {
  if (request.method === "POST" && request.url?.startsWith("/scenario/")) {
    scenario = request.url.slice("/scenario/".length);
    response.writeHead(204).end();
    return;
  }
  if (request.url === "/healthz") {
    response.setHeader("Content-Type", "application/json");
    if (scenario === "error") {
      response
        .writeHead(503)
        .end(JSON.stringify({ internal: "Do not expose this upstream body" }));
      return;
    }
    if (scenario === "redirect") {
      response.writeHead(302, { Location: "/redirected" }).end();
      return;
    }
    response.end(
      JSON.stringify(
        scenario === "invalid"
          ? { status: "ok", service: "different-service" }
          : { status: "ok", service: "cyber-range-backend" },
      ),
    );
    return;
  }
  response.writeHead(404).end();
});
server.listen(4101, "127.0.0.1");
process.on("SIGTERM", () => server.close());
process.on("SIGINT", () => server.close());
