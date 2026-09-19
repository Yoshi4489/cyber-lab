import { getBackendStatus } from "@/features/backend/adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { status: await getBackendStatus() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
