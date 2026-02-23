import { notFound } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, Market } from "@/types/markets";
import { MarketEditForm } from "@/components/markets/MarketEditForm";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function MarketEditPage({ params }: PageProps) {
  const { id } = await params;

  let market: Market;
  try {
    const res = await apiRequest<ApiResponse<Market>>(`/api/v1/markets/${id}`);
    market = res.data;
  } catch {
    notFound();
  }

  if (market.status !== "DRAFT") {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Edit Market</h1>
      <MarketEditForm market={market} />
    </div>
  );
}
