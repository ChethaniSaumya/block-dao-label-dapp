import { ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Section, Card } from "@/components/ui-bits";
import { NetworkGuard } from "@/components/NetworkGuard";
import { useI18n } from "@/lib/i18n";
import { Wallet, ArrowRight } from "lucide-react";

/**
 * WalletGuard — Higher-Order wrapper that blocks page render
 * if no wallet is connected. Shows a connect wallet prompt instead.
 * Used on all pages that require blockchain interaction (dashboard, staking, airdrop, etc).
 */
export function WalletGuard({ children }: { children: ReactNode }) {
  const { isConnected } = useAccount();
  const { t } = useI18n();

  if (!isConnected) {
    return (
      <Section className="py-24">
        <Card className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-gold mx-auto flex items-center justify-center shadow-gold">
            <Wallet className="w-8 h-8 text-gold-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">
            {t("Wallet Required")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("Connect a BNB Chain compatible wallet to access this page.")}
          </p>
          <div className="mt-8 flex justify-center">
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => (
                <button
                  onClick={openConnectModal}
                  disabled={!mounted}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-gold text-gold-foreground font-semibold shadow-gold hover:opacity-90 transition"
                >
                  {t("Connect Wallet")} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </ConnectButton.Custom>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {t(
              "We never store your private keys. All transactions are signed locally.",
            )}
          </p>
        </Card>
      </Section>
    );
  }

  return <NetworkGuard>{children}</NetworkGuard>;
}
