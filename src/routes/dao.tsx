import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Section,
  Card,
  GoldButton,
  PageHeader,
  OutlineButton,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { useAccount } from "wagmi";
import { getDaoAccount, DaoData } from "@/services/api";
import { ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/dao")({
  head: () => ({
    meta: [
      { title: `Creator DAO — ${BRAND.name}` },
      { name: "description", content: "Creator DAO governance." },
    ],
  }),
  component: () => (
    <WalletGuard>
      <CreatorDAO />
    </WalletGuard>
  ),
});

function CreatorDAO() {
  const { t } = useI18n();
  const { address } = useAccount();
  const [data, setData] = useState<DaoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      getDaoAccount(address)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [address]);

  return (
    <Section className="py-12">
      <PageHeader
        title={t("Creator DAO Account")}
        subtitle={t(
          "Manage your governance rights and ecosystem contributions.",
        )}
      />

      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <Card className="md:col-span-1 bg-gradient-hero border-none">
          <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-gold-foreground font-bold mb-4">
            {data?.account?.role?.[0] || "M"}
          </div>
          <h2 className="font-semibold text-lg">{t("DAO Role")}</h2>
          <p className="text-2xl font-display font-bold mt-1 text-[oklch(0.2_0_0)]">
            {data?.account?.role ? t(data.account.role) : "Loading..."}
          </p>
        </Card>
        <Card>
          <div className="text-sm text-muted-foreground">
            {t("Token Holdings")}
          </div>
          <div className="mt-2 text-2xl font-display font-semibold">
            {data?.account?.tokens_held || 0} {BRAND.symbol}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-muted-foreground">{t("Votes Cast")}</div>
          <div className="mt-2 text-2xl font-display font-semibold">
            {data?.account?.votes_cast || 0}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-muted-foreground">
            {t("Rewards Earned")}
          </div>
          <div className="mt-2 text-2xl font-display font-semibold text-[oklch(0.6_0.15_145)]">
            +{data?.account?.rewards_earned || 0} {BRAND.symbol}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {t("Governance Proposals")}
            </h2>
            <OutlineButton size="sm">{t("Submit Proposal")}</OutlineButton>
          </div>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">{t("ID")}</th>
                  <th className="text-left py-3 px-4 font-medium">
                    {t("Proposal")}
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    {t("Status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data?.proposals?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No proposals found.
                    </td>
                  </tr>
                ) : (
                  data?.proposals.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/20 transition">
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {p.proposal_id}
                      </td>
                      <td className="py-3 px-4 font-medium">{p.title}</td>
                      <td className="py-3 px-4 text-center">
                        {p.status === "Passed" ? (
                          <div className="flex items-center justify-center gap-1 text-[oklch(0.6_0.15_145)]">
                            <CheckCircle2 className="w-4 h-4" />{" "}
                            <span className="text-xs">Passed</span>
                          </div>
                        ) : p.status === "Rejected" ? (
                          <div className="flex items-center justify-center gap-1 text-destructive">
                            <XCircle className="w-4 h-4" />{" "}
                            <span className="text-xs">Rejected</span>
                          </div>
                        ) : (
                          <span className="text-xs text-[oklch(0.2_0_0)]">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("Participation History")}
          </h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">
                    {t("Action")}
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    {t("Reward")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : data?.participation?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No participation history yet.
                    </td>
                  </tr>
                ) : (
                  data?.participation.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/20 transition">
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{t(p.type)}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[oklch(0.6_0.15_145)]">
                        {p.reward > 0 ? `+${p.reward} ${BRAND.symbol}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      <div className="mt-12 text-center">
        <a
          href="https://app.blocklabel.vip"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GoldButton className="px-8">
            {t("View on Block Label")} <ExternalLink className="w-4 h-4 ml-2" />
          </GoldButton>
        </a>
      </div>
    </Section>
  );
}
