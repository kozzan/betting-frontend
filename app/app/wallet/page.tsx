import { WalletPageClient } from "@/components/wallet/WalletPageClient";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Wallet</h1>
      <WalletPageClient />
    </div>
  );
}
