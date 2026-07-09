import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Section,
  Card,
  Badge,
  GoldButton,
  OutlineButton,
  PageHeader,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { Copy, Share2 } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { getReferrals, ReferralData } from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/referral")({
  head: () => ({
    meta: [
      { title: `Referrals — ${BRAND.name}` },
      { name: "description", content: "Link2E referral program." },
    ],
  }),
  component: () => (
    <WalletGuard>
      <ReferralPage />
    </WalletGuard>
  ),
});

function ReferralPage() {
  const { t } = useI18n();
  const { address } = useAccount();
  const { jwt, _hasHydrated } = useAuthStore();
  const link =
    "https://app.blocklabel.vip/#/myinvite?code=0xF148fA0C97696564395be20f34E2e755607e07dD";

  const [data, setData] = useState<ReferralData>({
    referrals: [],
    stats: { totalReferrals: 0, totalRewards: 0, pendingRewards: 0, stakedBlockLabel: "0" },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth store to hydrate AND have a valid JWT before fetching
    if (!address || !_hasHydrated || !jwt) return;

    console.log("[Referral UI] Initializing fetch for:", address);
    getReferrals(address)
      .then((res) => {
        console.log("[Referral UI] Success! Received data:", res);
        setData(res);
      })
      .catch((err) => {
        console.error("[Referral UI] Error fetching referrals:", err);
      })
      .finally(() => setLoading(false));
  }, [address, jwt, _hasHydrated]);

  return (
    <Section className="py-12">
      <PageHeader
        title={t("Link2E Referral Program")}
        subtitle={t(
          "Invite wallets to the {{BRAND}} ecosystem and earn rewards.",
        )}
      />

      <Card>
        <label className="text-sm text-muted-foreground">
          {t("Your Referral Link")}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border font-mono text-sm"
          />
          <OutlineButton
            onClick={() => {
              navigator.clipboard?.writeText(link);
              toast("Link copied");
            }}
          >
            <Copy className="w-4 h-4" />
            {t("Copy")}
          </OutlineButton>
        </div>
      </Card>

      <div className="mt-6 grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Block Label Staked",
            value: loading ? "..." : `${parseFloat(data.stats.stakedBlockLabel || "0").toLocaleString()} WK`,
          },
          {
            label: "Total Referrals",
            value: loading ? "..." : data.stats.totalReferrals.toString(),
          },
          {
            label: "Rewards Earned",
            value: loading
              ? "..."
              : `${data.stats.totalRewards.toLocaleString()} ${BRAND.symbol}`,
          },
          {
            label: "Pending Rewards",
            value: loading
              ? "..."
              : `${data.stats.pendingRewards.toLocaleString()} ${BRAND.symbol}`,
          },
        ].map((s) => (
          <Card key={s.label}>
            <div className="text-sm text-muted-foreground">{t(s.label)}</div>
            <div className="mt-2 font-display text-2xl font-semibold">
              {s.value}
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-xl font-semibold">
        {t("Referred Wallets")}
      </h2>
      <Card>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading referrals...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 font-medium">
                    {t("Wallet Address")}
                  </th>
                  <th className="text-left py-2 font-medium">
                    {t("Origin")}
                  </th>
                  <th className="text-left py-2 font-medium">{t("Status")}</th>
                  <th className="text-right py-2 font-medium">{t("Reward")}</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No referrals found yet. Share your link!
                    </td>
                  </tr>
                ) : (
                  data.referrals.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition"
                    >
                      <td className="py-3 font-mono">
                        {r.referred_address}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        Block Label
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="success"
                        >
                          {t("Verified")}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-mono font-medium">
                        {r.reward_amount > 0 ? `${r.reward_amount} ${BRAND.symbol}` : "—"}
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
