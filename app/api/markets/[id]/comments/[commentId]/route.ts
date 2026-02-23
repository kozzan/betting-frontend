import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string; commentId: string }> };

export async function DELETE(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id, commentId } = await params;
  return proxyDelete(`/api/v1/markets/${id}/comments/${commentId}`);
}
