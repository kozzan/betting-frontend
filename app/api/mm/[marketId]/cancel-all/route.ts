import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/proxy";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
) {
  const { marketId } = await params;
  return proxyDelete(`/api/v1/mm/${marketId}/cancel-all`);
}
