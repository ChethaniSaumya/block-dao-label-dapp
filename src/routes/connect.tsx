import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Shield, ChevronRight, CheckCircle2 } from "lucide-react";
import { Section, Card } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: `Connect Wallet — ${BRAND.name}` },
      {
        name: "description",
        content: `Connect a BNB Chain compatible wallet to access ${BRAND.name}.`,
      },
    ],
  }),
  component: Connect,
});

function Connect() {
  const { t } = useI18n();
  const { isConnected } = useAccount();
  const wallets = [
    { name: "MetaMask", color: "bg-orange-500/10 text-orange-400" },
    { name: "Trust Wallet", color: "bg-blue-500/10 text-blue-400" },
    { name: "WalletConnect", color: "bg-cyan-500/10 text-cyan-400" },
  ];
  const steps = ["Connect Wallet", "Verify Eligibility", "Access Dashboard"];
  const currentStep = isConnected ? 1 : 0;

  return (
    <Section className="py-20">
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold mx-auto flex items-center justify-center shadow-gold">
            <Wallet className="w-7 h-7 text-gold-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">
            {t("Connect Your Wallet")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "Connect a BNB Chain compatible wallet to access {{BRAND}} features",
            )}
          </p>

          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const connected = mounted && account && chain;

              if (connected) {
                return (
                  <div className="mt-8 space-y-4">
                    <div className="p-4 rounded-lg border border-[oklch(0.72_0.18_150_/_40%)] bg-[oklch(0.72_0.18_150_/_8%)]">
                      <div className="flex items-center justify-center gap-2 text-[oklch(0.72_0.18_150)]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold">
                          {t("Wallet Connected")}
                        </span>
                      </div>
                      <button
                        onClick={openAccountModal}
                        className="mt-2 text-sm text-muted-foreground hover:text-foreground transition"
                      >
                        {account.displayName}
                        {account.displayBalance
                          ? ` · ${account.displayBalance}`
                          : ""}
                      </button>
                    </div>
                    {chain.unsupported && (
                      <button
                        onClick={openChainModal}
                        className="w-full p-3 rounded-lg bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition"
                      >
                        {t("Switch to correct network")}
                      </button>
                    )}
                    <Link
                      to="/dashboard"
                      className="block w-full p-3 rounded-lg bg-gradient-gold text-gold-foreground font-semibold text-sm text-center shadow-gold hover:opacity-90 transition"
                    >
                      {t("Go to Dashboard")} →
                    </Link>
                  </div>
                );
              }

              return (
                <div className="mt-8 space-y-3">
                  {wallets.map((w) => (
                    <button
                      key={w.name}
                      onClick={openConnectModal}
                      className="w-full flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg ${w.color} flex items-center justify-center font-bold`}
                        >
                          {w.name[0]}
                        </div>
                        <span className="font-medium">{t(w.name)}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition" />
                    </button>
                  ))}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </Card>

        <div className="mt-8 flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStep ? "bg-gradient-gold text-gold-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="mt-2 text-xs text-center text-muted-foreground">
                  {t(s)}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-px -mt-6 ${i < currentStep ? "bg-[oklch(0.2_0_0)]" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5" />{" "}
          {t(
            "We never store your private keys. All transactions are signed locally.",
          )}
        </p>

        <p className="mt-4 text-center text-xs">
          <Link
            to="/dashboard"
            className="text-[oklch(0.2_0_0)] hover:underline"
          >
            {t("Skip to demo dashboard →")}
          </Link>
        </p>
      </div>
    </Section>
  );
}
