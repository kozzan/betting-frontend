import { MarketCreateForm } from "@/components/markets/MarketCreateForm";

export default function MarketCreatePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Create a Market</h1>
      <MarketCreateForm />
    </div>
  );
}
