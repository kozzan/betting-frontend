import { NextRequest } from "next/server";
import { proxyDelete } from "@/lib/proxy";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(`/api/v1/alerts/${id}`);
}
