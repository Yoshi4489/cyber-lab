import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { COMMENT_HEADER, astToString } from "openapi-typescript";
import openapiTS from "openapi-typescript";

const outputPath = resolve("src/features/backend/generated/openapi.ts");
const checkOnly = process.argv.includes("--check");
const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  throw new Error("BACKEND_URL must be set to generate API types.");
}

const base = parseBackendUrl(backendUrl);
const documentUrl = new URL("/v1/openapi.json", base);
const response = await fetch(documentUrl, {
  headers: { Accept: "application/json" },
  redirect: "error",
  signal: AbortSignal.timeout(10_000),
});

if (!response.ok) {
  throw new Error(
    `OpenAPI request failed with HTTP ${response.status} at ${documentUrl.origin}.`,
  );
}

const contentType = response.headers.get("content-type")?.split(";", 1)[0];
if (contentType !== "application/json") {
  throw new Error("OpenAPI request did not return application/json.");
}

const document = await response.json();
if (
  typeof document !== "object" ||
  document === null ||
  typeof document.openapi !== "string" ||
  !document.openapi.startsWith("3.")
) {
  throw new Error("OpenAPI request did not return an OpenAPI 3 document.");
}

const ast = await openapiTS(document, { alphabetize: true });
const output = `${COMMENT_HEADER}// Source: GET /v1/openapi.json\n\n${astToString(ast)}`;

if (checkOnly) {
  let existing = "";
  try {
    existing = await readFile(outputPath, "utf8");
  } catch {
    throw new Error("Generated API types are missing. Run npm run api:types.");
  }
  if (existing !== output) {
    throw new Error("Generated API types are stale. Run npm run api:types.");
  }
  process.stdout.write("Generated API types are up to date.\n");
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await writeFile(temporaryPath, output, "utf8");
  await rename(temporaryPath, outputPath);
  process.stdout.write(`Generated ${outputPath}\n`);
}

function parseBackendUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("BACKEND_URL must be an absolute HTTP(S) URL.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !["", "/"].includes(url.pathname)
  ) {
    throw new Error("BACKEND_URL must be a credential-free API origin.");
  }

  const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
  if (
    process.env.NODE_ENV === "production" &&
    url.protocol !== "https:" &&
    !loopbackHosts.has(url.hostname)
  ) {
    throw new Error("Production BACKEND_URL must use HTTPS outside loopback.");
  }

  return url;
}
