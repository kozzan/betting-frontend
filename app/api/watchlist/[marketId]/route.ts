import { NextRequest, NextResponse } from "next/server";
import { proxyPost, proxyDelete } from "@/lib/proxy";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await params;
  return proxyPost(`/api/v1/watchlist/${marketId}`, "");
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ marketId: string }> }
): Promise<NextResponse> {
  const { marketId } = await params;
  return proxyDelete(`/api/v1/watchlist/${marketId}`);
}
