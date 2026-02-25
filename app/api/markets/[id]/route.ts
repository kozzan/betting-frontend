import { NextRequest } from "next/server";
import { proxyGet, proxyPatch, proxyDelete } from "@/lib/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(`/api/v1/markets/${id}`);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.text();
  return proxyPatch(`/api/v1/markets/${id}`, body);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyDelete(`/api/v1/markets/${id}`);
}
