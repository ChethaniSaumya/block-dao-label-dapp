import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coins,
  Gift,
  ShieldCheck,
  FileCheck2,
  Globe,
  Zap,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Section, Card, GoldButton, OutlineButton } from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} — ${BRAND.tagline}` },
      {
        name: "description",
        content: `BEP-20 utility token on BNB Chain. Stake on Block Label, qualify, and receive ${BRAND.symbol} airdrops via the Link2E mechanism.`,
      },
      { property: "og:title", content: `${BRAND.name} — Decentralized Commerce` },
      {
        property: "og:description",
        content: `Join the Block Label ecosystem and receive ${BRAND.symbol} airdrops on BNB Chain.`,
      },
    ],
  }),
  component: Home,
});

const WEBKEY_INVITE_LINK =
  "https://app.blocklabel.vip/#/myinvite?code=0xF148fA0C97696564395be20f34E2e755607e07dD";
const TOKEN_CONTRACT = "0xbB20472e60b024C0f62c3997B34fc94d5BC8B9E8";
const BSCSCAN_URL = `https://bscscan.com/address/${TOKEN_CONTRACT}`;
const partners = [
  "BNB Chain",
  "CertiK",
  "Block Label",
  "Link2E",
  "BscScan",
  "Chainlink",
  "PancakeSwap",
  "Trust Wallet",
];

/** Gold-styled RainbowKit connect / account button for use inline in page content */
function WalletButton({ fullWidth = false }: { fullWidth?: boolean }) {
  const { t } = useI18n();
  return (
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
        const cls = `inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-gold text-gold-foreground font-semibold text-sm shadow-gold hover:opacity-90 transition${fullWidth ? " w-full justify-center" : ""}`;

        if (!connected) {
          return (
            <button onClick={openConnectModal} className={cls}>
              {t("Connect Wallet")} <ArrowRight className="w-4 h-4" />
            </button>
          );
        }
        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition"
            >
              Wrong Network
            </button>
          );
        }
        return (
          <button onClick={openAccountModal} className={cls}>
            {account.displayName}
            {account.displayBalance ? ` · ${account.displayBalance}` : ""}
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

function Home() {
  const { t } = useI18n();
  const { isConnected } = useAccount();

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden aurora">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <Section className="py-24 md:py-36 relative z-10">
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[oklch(0.2_0_0)]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.72_0.18_150)] animate-pulse" />
                {t("Live on BNB Chain")} · v2.0
              </div>
              <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1]">
                {t("Technology & Art,")}
                <br />
                <span className="text-gradient-gold">{t("Creating New")}</span>
                <br />
                <span className="text-gradient-gold">{t("Entertainment.")}</span>
              </h1>
              <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t(
                  "{{BRAND}} ({{SYMBOL}}) is the native utility and governance token of the Block Label Foundation ecosystem on BNB Chain — a fixed 10-billion supply, community-first distribution, and a rules-based buyback & burn.",
                )}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                {/* Launch App — opens wallet modal if not connected, else goes to dashboard */}
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
                    return (
                      <GoldButton
                        onClick={
                          !connected
                            ? openConnectModal
                            : chain.unsupported
                              ? openChainModal
                              : () => (window.location.href = "/dashboard")
                        }
                      >
                        {!connected ? (
                          <>
                            {t("Launch App")} <ArrowRight className="w-4 h-4" />
                          </>
                        ) : chain.unsupported ? (
                          "Wrong Network"
                        ) : (
                          <>
                            {t("Launch App")} <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </GoldButton>
                    );
                  }}
                </ConnectButton.Custom>


              </div>

              <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-gradient-gold border-2 border-background"
                      style={{ filter: `hue-rotate(${i * 30}deg)` }}
                    />
                  ))}
                </div>
                <div>
                  <span className="text-foreground font-semibold">12,480+</span>{" "}
                  {t("holders trust {{SYMBOL}}")}
                </div>
              </div>
            </div>

            {/* Floating coin */}
            <div className="relative h-80 md:h-[28rem] hidden lg:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-72 h-72 rounded-full bg-gradient-gold opacity-20 blur-3xl animate-pulse" />
                <div className="relative animate-float">
                  <div className="w-56 h-56 rounded-full bg-gradient-gold glow-ring flex items-center justify-center shadow-gold relative overflow-hidden">
                    <div className="absolute inset-0 animate-shimmer" />
                    <div className="relative z-10 text-center">
                      <div className="font-display text-7xl font-bold text-gold-foreground">
                        {BRAND.initial}
                      </div>
                      <div className="font-mono text-xs text-gold-foreground/70 mt-1 tracking-widest uppercase">
                        {BRAND.shortName}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-6 rounded-full border border-[oklch(0.2_0_0_/_30%)] animate-spin-slow" />
                  <div
                    className="absolute -inset-12 rounded-full border border-dashed border-[oklch(0.2_0_0_/_15%)] animate-spin-slow"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "30s",
                    }}
                  />
                </div>
              </div>
              {/* floating chips */}
              <div
                className="absolute top-6 right-4 glass rounded-xl px-3 py-2 text-xs font-mono animate-float"
                style={{ animationDelay: "-2s" }}
              >
                <div className="text-muted-foreground">{BRAND.symbol}/USD</div>
                <div className="flex items-center gap-1 text-[oklch(0.72_0.18_150)] font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  $0.124
                </div>
              </div>

            </div>
          </div>
        </Section>
      </div>


      {/* Partner ticker */}
      <div className="border-b border-border py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {[...partners, ...partners].map((p, i) => (
            <div
              key={i}
              className="font-display text-xl text-muted-foreground/60 hover:text-foreground transition flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.2_0_0)]" />
              {p}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <Section className="py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Total Supply", value: "10,000,000,000", suffix: BRAND.symbol },
            { label: "Holders", value: "12,480", suffix: "+" },
            {
              label: "Token Contract",
              value: `${TOKEN_CONTRACT.slice(0, 6)}...${TOKEN_CONTRACT.slice(-4)}`,
              suffix: "",
              link: BSCSCAN_URL,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className="hover-lift relative overflow-hidden animate-fade-up"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-gold opacity-10 blur-2xl" />
              <div className="text-sm text-muted-foreground">{t(s.label)}</div>
              <div className="mt-2 flex items-baseline gap-2">
                {s.link ? (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xl font-semibold text-[oklch(0.2_0_0)] hover:underline flex items-center gap-2"
                  >
                    {s.value} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="font-display text-4xl font-semibold text-gradient-gold">
                    {s.value}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {s.suffix}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* How it works — 3-step flow: Join Block Label → Stake → Receive Token */}
      <Section className="py-24">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.2em] text-[oklch(0.2_0_0)] mb-3">
            {t("Get Started")}
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold mb-3">
            {t("How It Works")}
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            {t("Three simple steps to receive {{SYMBOL}} tokens.")}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              step: 1,
              title: "Verification",
              desc: "Complete the manual off-chain verification process.",
              action: null,
            },
            {
              icon: Gift,
              step: 2,
              title: "Receive {{SYMBOL}} Airdrop",
              desc: "Once verified, your wallet is added to the smart contract to claim {{SYMBOL}} securely.",
              action: null,
            },
          ].map((s) => (
            <Card key={s.title} className="relative hover-lift group">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-gold text-gold-foreground font-bold text-sm flex items-center justify-center shadow-gold">
                {s.step}
              </div>
              <div className="w-14 h-14 rounded-xl bg-[oklch(0.2_0_0_/_10%)] border border-[oklch(0.2_0_0_/_20%)] flex items-center justify-center group-hover:scale-110 transition">
                <s.icon className="w-6 h-6 text-[oklch(0.2_0_0)]" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{t(s.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(s.desc)}</p>
              {s.action && (
                <a
                  href={s.action}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-[oklch(0.2_0_0)] hover:underline"
                >
                  {t("Open")} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Card>
          ))}
        </div>
      </Section>

      {/* Why Choose Us — 4 feature cards */}
      <Section className="py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-[oklch(0.2_0_0)] mb-3">
          {t("Why Us")}
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold mb-12 max-w-2xl">
          {t("Built different.")}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FileCheck2,
              title: "Open Smart Contracts",
              desc: "Every contract is public, auditable, and verifiable on BscScan.",
            },
            {
              icon: ShieldCheck,
              title: "CertiK Audited",
              desc: "Three independent audits ensure code integrity and security.",
            },
            {
              icon: Zap,
              title: "BNB Chain Native",
              desc: "Lightning-fast transactions with negligible fees on BSC.",
            },
            {
              icon: Globe,
              title: "Global & Multilingual",
              desc: "Built for a global community — English and 한국어 from day one.",
            },
          ].map((f) => (
            <Card key={f.title} className="hover-lift group">
              <f.icon className="w-7 h-7 text-[oklch(0.2_0_0)] group-hover:scale-110 transition" />
              <h3 className="mt-4 font-semibold">{t(f.title)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(f.desc)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Roadmap */}
      <Section className="py-24">
        <div className="text-xs uppercase tracking-[0.2em] text-[oklch(0.2_0_0)] mb-3">
          {t("The Path")}
        </div>
        <h2 className="text-4xl md:text-5xl font-semibold mb-12">
          {t("Roadmap")}
        </h2>
        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-[oklch(0.2_0_0_/_50%)] to-transparent" />
          {[
            {
              phase: "Phase 1",
              title: "Infrastructure",
              status: "done",
              icon: CheckCircle2,
              desc: "Token deployment, CertiK audit (3x), and Block Label partner integration.",
            },
            {
              phase: "Phase 2",
              title: "DApp Launch",
              status: "active",
              icon: Loader2,
              desc: "Web app, wallet onboarding, Link2E airdrops, and Creator DAO.",
            },
            {
              phase: "Phase 3",
              title: "Market Expansion",
              status: "upcoming",
              icon: Circle,
              desc: "Multi-language rollout, global partnerships, and exchange listings.",
            },
          ].map((p) => (
            <Card
              key={p.phase}
              className={`hover-lift relative ${p.status === "active" ? "border-[oklch(0.2_0_0_/_50%)] shadow-gold" : ""}`}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <p.icon
                  className={`w-4 h-4 ${p.status === "active" ? "animate-spin text-[oklch(0.2_0_0)]" : p.status === "done" ? "text-[oklch(0.72_0.18_150)]" : ""}`}
                />
                {t(p.phase)}
              </div>
              <h3 className="mt-2 text-2xl font-semibold">{t(p.title)}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{t(p.desc)}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA — Join Block Label */}
      <Section className="py-24">
        <div className="rounded-3xl relative overflow-hidden aurora p-12 md:p-20 text-center border border-border">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
              {t("Ready to get")}{" "}
              <span className="text-gradient-gold">{t("started?")}</span>
            </h2>
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-lg">
              {t(
                "Join the Block Label ecosystem and receive {{SYMBOL}} airdrops automatically through Link2E.",
              )}
            </p>
            <div className="mt-10 flex justify-center gap-3 flex-wrap">

              <WalletButton />
              <Link to="/dashboard">
                <OutlineButton>{t("View Dashboard")}</OutlineButton>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
