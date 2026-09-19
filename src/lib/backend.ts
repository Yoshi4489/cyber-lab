import "server-only";
import { z } from "zod";

const healthSchema = z.object({
  status: z.literal("ok"),
  service: z.literal("cyber-range-backend"),
});
export type BackendStatus = "not-configured" | "reachable" | "unavailable";

// Fixed path and deployment-owned origin: no user-controlled proxy destination.
export async function getBackendStatus(): Promise<BackendStatus> {
  if (!process.env.BACKEND_URL) return "not-configured";
  try {
    const base = new URL(process.env.BACKEND_URL);
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password ||
      base.search ||
      base.hash
    )
      return "unavailable";
    if (
      process.env.NODE_ENV === "production" &&
      base.protocol !== "https:" &&
      !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)
    )
      return "unavailable";
    const response = await fetch(new URL("/healthz", base), {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
      redirect: "error",
    });
    if (!response.ok) return "unavailable";
    return healthSchema.safeParse(await response.json()).success
      ? "reachable"
      : "unavailable";
  } catch {
    return "unavailable";
  }
}
