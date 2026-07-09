import { useAccount, useSwitchChain } from "wagmi";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";
import { Card, GoldButton, Section } from "./ui-bits";

const REQUIRED_CHAIN_ID = parseInt(import.meta.env.VITE_BSC_CHAIN_ID || "56");

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (chain && chain.id !== REQUIRED_CHAIN_ID) {
    return (
      <Section className="py-20">
        <Card className="max-w-md mx-auto text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-warning mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("Wrong Network")}</h2>
          <p className="text-muted-foreground mb-6">
            {t(
              "Please switch your wallet to BNB Smart Chain to interact with {{BRAND}}.",
            )}
          </p>
          <GoldButton
            onClick={() =>
              switchChain && switchChain({ chainId: REQUIRED_CHAIN_ID })
            }
            disabled={!switchChain}
            className="w-full justify-center"
          >
            {t("Switch Network")}
          </GoldButton>
        </Card>
      </Section>
    );
  }

  return <>{children}</>;
}
