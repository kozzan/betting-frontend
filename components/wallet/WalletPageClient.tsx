"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCents, getErrorMessage } from "@/lib/format";
import { walletFetcher } from "@/lib/fetchers";
import type { Transaction } from "@/types/wallet";
import type { ApiResponse, PagedResponse } from "@/types/markets";

async function transactionsFetcher(url: string): Promise<PagedResponse<Transaction>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Transactions fetch failed: ${res.status}`);
  const json: ApiResponse<PagedResponse<Transaction>> = await res.json();
  return json.data;
}

function BalanceCard({ label, value, dim }: { readonly label: string; readonly value: string; readonly dim?: boolean }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold tabular-nums${dim ? " text-muted-foreground" : ""}`}>{value}</p>
    </div>
  );
}

function AmountForm({
  label,
  buttonLabel,
  onSubmit,
}: {
  readonly label: string;
  readonly buttonLabel: string;
  readonly onSubmit: (amountCents: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dollars = Number.parseFloat(amount);
  const valid = !Number.isNaN(dollars) && dollars > 0;
  const amountCents = valid ? Math.round(dollars * 100) : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    try {
      await onSubmit(amountCents);
      setAmount("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={label} className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            id={label}
            type="number"
            min={0.01}
            step={0.01}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
          />
        </div>
      </div>
      {valid && (
        <p className="text-sm text-muted-foreground">
          {buttonLabel} {formatCents(amountCents)}
        </p>
      )}
      <Button type="submit" disabled={submitting || !valid} className="w-full">
        {submitting ? "Processing…" : buttonLabel}
      </Button>
    </form>
  );
}

export function WalletPageClient() {
  const { data: wallet, mutate: mutateWallet } = useSWR("/api/wallet", walletFetcher, {
    refreshInterval: 30_000,
  });
  const [txPage, setTxPage] = useState(0);
  const { data: txData, mutate: mutateTx } = useSWR(
    `/api/wallet/transactions?page=${txPage}&size=20&sort=createdAt,desc`,
    transactionsFetcher
  );

  async function handleFundsAction(endpoint: string, successMsg: string, amountCents: number) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCents }),
    });
    if (!res.ok) {
      toast.error(await getErrorMessage(res));
      return;
    }
    toast.success(successMsg);
    mutateWallet().catch((e: unknown) => console.error("Wallet revalidation failed", e));
    mutateTx().catch((e: unknown) => console.error("Transactions revalidation failed", e));
  }

  const handleDeposit = (amountCents: number) =>
    handleFundsAction("/api/wallet/deposits", "Deposit successful", amountCents);
  const handleWithdraw = (amountCents: number) =>
    handleFundsAction("/api/wallet/withdrawals", "Withdrawal successful", amountCents);

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BalanceCard label="Available" value={wallet ? formatCents(wallet.availableCents) : "—"} />
        <BalanceCard label="Held" value={wallet ? formatCents(wallet.heldCents) : "—"} dim />
        <BalanceCard label="Total" value={wallet ? formatCents(wallet.balanceCents) : "—"} />
      </div>

      {/* Deposit / Withdraw tabs */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">Funds</span>
        </div>
        <div className="p-4">
          <Tabs defaultValue="deposit">
            <TabsList>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <AmountForm label="Amount" buttonLabel="Deposit" onSubmit={handleDeposit} />
            </TabsContent>
            <TabsContent value="withdraw">
              <AmountForm label="Amount" buttonLabel="Withdraw" onSubmit={handleWithdraw} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Transaction history */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <span className="text-sm font-medium">Transaction History</span>
        </div>
        {!txData || txData.content.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground text-sm">No transactions yet.</p>
        ) : (
          <>
            <table className="w-full text-sm" aria-label="Transaction history">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {txData.content.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium uppercase tracking-wide ${
                          tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? "+ " : "− "}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium">
                      {tx.type === "DEPOSIT" ? "+" : "-"}
                      {formatCents(tx.amountCents)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {txData.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  Page {txData.page + 1} of {txData.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={txData.page === 0}
                    onClick={() => setTxPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={txData.page + 1 >= txData.totalPages}
                    onClick={() => setTxPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
