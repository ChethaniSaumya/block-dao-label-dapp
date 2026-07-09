import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Section,
  Card,
  GoldButton,
  OutlineButton,
  PageHeader,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { useAccount, useDisconnect } from "wagmi";
import { toast } from "sonner";
import { getProfile, updateProfile, UserProfile } from "@/services/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: `Profile — ${BRAND.name}` },
      { name: "description", content: "Wallet & account settings." },
    ],
  }),
  component: () => (
    <WalletGuard>
      <Profile />
    </WalletGuard>
  ),
});

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[oklch(0.2_0_0)]" : "bg-muted"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

function Profile() {
  const { t, lang, setLang } = useI18n();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [airdrop, setAirdrop] = useState(true);
  const [staking, setStaking] = useState(true);
  const [price, setPrice] = useState(false);

  useEffect(() => {
    if (address) {
      getProfile()
        .then((data) => {
          setProfile(data);
          setName(data.display_name || "");
          setAirdrop(data.notif_airdrop);
          setStaking(data.notif_staking);
          setPrice(data.notif_price);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [address]);

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "—";

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        display_name: name,
        notif_airdrop: airdrop,
        notif_staking: staking,
        notif_price: price,
      });
      toast.success(t("Settings saved"));
    } catch (err: unknown) {
      toast.error("Failed to save", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section className="py-12">
      <PageHeader title={t("Profile & Settings")} />

      <div className="space-y-6 max-w-3xl">
        <Card>
          <h3 className="font-semibold mb-4">{t("Connected Wallet")}</h3>
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary">
            <div>
              <div className="font-mono">{shortAddr}</div>
              <div className="text-xs text-muted-foreground mt-1">
                BNB Chain · {t("Connected")}
              </div>
            </div>
            <OutlineButton
              onClick={() => {
                disconnect();
                toast(t("Wallet disconnected"));
              }}
            >
              {t("Disconnect")}
            </OutlineButton>
          </div>
        </Card>

        {loading ? (
          <Card className="py-12 text-center text-muted-foreground">
            Loading profile...
          </Card>
        ) : (
          <>
            <Card>
              <h3 className="font-semibold mb-4">{t("Account Settings")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {t("Display Name")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 rounded-md bg-input border border-border"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    {t("Preferred Language")}
                  </label>
                  <select
                    className="w-full px-4 py-2 rounded-md bg-input border border-border"
                    value={lang}
                    onChange={(e) => setLang(e.target.value as "en" | "kr")}
                  >
                    <option value="en">English</option>
                    <option value="kr">한국어</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold mb-4">{t("Notifications")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Airdrop Alerts")}</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when airdrops are distributed
                    </div>
                  </div>
                  <Toggle checked={airdrop} onChange={setAirdrop} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Staking Reminders")}</div>
                    <div className="text-sm text-muted-foreground">
                      Alerts for Block Label threshold changes
                    </div>
                  </div>
                  <Toggle checked={staking} onChange={setStaking} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t("Price Alerts")}</div>
                    <div className="text-sm text-muted-foreground">
                      Major {BRAND.symbol} price movements
                    </div>
                  </div>
                  <Toggle checked={price} onChange={setPrice} />
                </div>
              </div>
            </Card>

            <div className="flex justify-end pt-4">
              <GoldButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : t("Save Settings")}
              </GoldButton>
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
