import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  BackendAdapterError,
  BackendHttpError,
  BackendResponseError,
  getBackendChallenge,
  getBackendLiveness,
  getBackendLeaderboard,
  listBackendCategories,
  listBackendChallenges,
} from "../../src/features/backend/adapter";
import { createBackendFixture } from "../fixtures/backend.mjs";

const originalBackendUrl = process.env.BACKEND_URL;
const fixture = createBackendFixture();
let fixtureOrigin = "";

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    fixture.server.once("error", reject);
    fixture.server.listen(0, "127.0.0.1", resolve);
  });
  const address = fixture.server.address() as AddressInfo;
  fixtureOrigin = `http://127.0.0.1:${address.port}`;
  process.env.BACKEND_URL = fixtureOrigin;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    fixture.server.close((error) => (error ? reject(error) : resolve()));
  });
  if (originalBackendUrl === undefined) {
    delete process.env.BACKEND_URL;
  } else {
    process.env.BACKEND_URL = originalBackendUrl;
  }
});

beforeEach(() => {
  process.env.BACKEND_URL = fixtureOrigin;
  fixture.setScenario("healthy");
});

describe("backend adapter", () => {
  it("validates each public read response", async () => {
    await expect(getBackendLiveness()).resolves.toEqual({ status: "ok" });
    await expect(listBackendCategories()).resolves.toEqual({
      categories: ["web", "crypto"],
    });
    await expect(listBackendChallenges()).resolves.toMatchObject({
      source: "database",
      challenges: [{ slug: "intro-web", points: 100 }],
    });
    await expect(getBackendChallenge("intro-web")).resolves.toMatchObject({
      slug: "intro-web",
      difficulty: "easy",
    });
    await expect(getBackendLeaderboard()).resolves.toMatchObject({
      source: "database",
      entries: [{ rank: 1, displayName: "Loopback Learner" }],
    });
  });

  it("uses a fixed GET path without an acting user id", async () => {
    await getBackendChallenge("intro/web");

    expect(fixture.requests().at(-1)).toMatchObject({
      method: "GET",
      url: "/v1/challenges/intro%2Fweb",
      headers: {
        accept: "application/json",
      },
    });
    expect(fixture.requests().at(-1)?.headers["x-request-id"]).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
    expect(fixture.requests().at(-1)?.headers["content-length"]).toBeUndefined();
  });

  it("maps standard error envelopes without exposing their message", async () => {
    fixture.setScenario("error");

    await expect(getBackendChallenge("missing")).rejects.toMatchObject({
      name: "BackendHttpError",
      status: 429,
      code: "RATE_LIMITED",
      correlationId: "d48b142b-4929-44e9-8ac5-153771f475a4",
      message: "Backend request failed with HTTP 429.",
    } satisfies Partial<BackendHttpError>);
  });

  it("fails closed for malformed successful and error responses", async () => {
    fixture.setScenario("invalid");
    await expect(listBackendChallenges()).rejects.toBeInstanceOf(BackendResponseError);

    fixture.setScenario("non-json");
    await expect(listBackendCategories()).rejects.toBeInstanceOf(BackendResponseError);

    fixture.setScenario("invalid-error");
    await expect(getBackendLeaderboard()).rejects.toMatchObject({
      name: "BackendHttpError",
      status: 503,
      code: undefined,
      correlationId: undefined,
    } satisfies Partial<BackendHttpError>);
  });

  it("rejects a missing backend origin before making a request", async () => {
    delete process.env.BACKEND_URL;
    await expect(getBackendLiveness()).rejects.toBeInstanceOf(BackendAdapterError);
  });
});
