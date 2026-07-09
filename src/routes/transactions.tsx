import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Section,
  Card,
  Badge,
  OutlineButton,
  PageHeader,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { Download, Search, Copy } from "lucide-react";
import { useAccount } from "wagmi";
import { getTransactions, Transaction } from "@/services/api";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: `Transactions — ${BRAND.name}` },
      { name: "description", content: "Full transaction history." },
    ],
  }),
  component: () => (
    <WalletGuard>
      <Transactions />
    </WalletGuard>
  ),
});

function Transactions() {
  const { t } = useI18n();
  const { address } = useAccount();
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      getTransactions(address)
        .then(setTxs)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [address]);

  return (
    <Section className="py-12">
      <PageHeader
        title={t("Transaction History")}
        subtitle={t("All your on-chain activity in one place.")}
      />

      <Card className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("Search TX hash...")}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-input border border-border text-sm"
          />
        </div>
        <select className="px-3 py-2 rounded-md bg-input border border-border text-sm">
          <option>{t("All Types")}</option>
          <option>Airdrop</option>
          <option>Stake</option>
          <option>Transfer</option>
        </select>
        <OutlineButton onClick={() => alert("CSV Download generation")}>
          <Download className="w-4 h-4" />
          {t("Download CSV")}
        </OutlineButton>
      </Card>

      <Card>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading transactions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 font-medium">{t("TX Hash")}</th>
                  <th className="text-left py-2 font-medium">{t("Type")}</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-right py-2 font-medium">{t("Amount")}</th>
                  <th className="text-right py-2 font-medium">{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No transactions found for this wallet.
                    </td>
                  </tr>
                ) : (
                  txs.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition"
                    >
                      <td className="py-3 flex items-center gap-2">
                        <span className="font-mono">
                          {tx.tx_hash.slice(0, 6)}...{tx.tx_hash.slice(-4)}
                        </span>
                        <button className="text-muted-foreground hover:text-foreground">
                          <Copy className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="py-3 font-medium">{t(tx.type)}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">
                        {tx.amount}
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant={
                            tx.status === "Success" ? "success" : "warning"
                          }
                        >
                          {t(tx.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Section>
  );
}
