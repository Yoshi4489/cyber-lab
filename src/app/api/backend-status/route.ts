import { getBackendStatus } from "@/lib/backend";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { status: await getBackendStatus() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
