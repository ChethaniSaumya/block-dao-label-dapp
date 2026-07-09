import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Section,
  Card,
  GoldButton,
  OutlineButton,
  PageHeader,
} from "@/components/ui-bits";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ExternalLink, Shield, FileCheck2, Zap, Globe } from "lucide-react";

const BSCSCAN_CONTRACT =
  "https://bscscan.com/address/0xbB20472e60b024C0f62c3997B34fc94d5BC8B9E8";
const WEBKEY_INVITE_LINK =
  "https://app.blocklabel.vip/#/myinvite?code=0xF148fA0C97696564395be20f34E2e755607e07dD";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${BRAND.name}` },
      {
        name: "description",
        content: `${BRAND.name} (${BRAND.symbol}) is the native utility and governance token of the ${BRAND.foundation} ecosystem on BNB Chain — fixed 10B supply, community-first distribution, and a rules-based buyback & burn.`,
      },
      { property: "og:title", content: `About ${BRAND.name}` },
      {
        property: "og:description",
        content: `The utility and governance token of the ${BRAND.foundation} ecosystem on BNB Chain.`,
      },
    ],
  }),
  component: About,
});

const team = [
  { initials: "JK", name: "Jin Kang", role: "Founder & Architect" },
  { initials: "ML", name: "Maria Lin", role: "Lead Smart Contract Engineer" },
  { initials: "DR", name: "David Reyes", role: "Head of Ecosystem" },
];

const facts = [
  { label: "Token Standard", value: "BEP-20", icon: FileCheck2 },
  { label: "Chain", value: "BNB Chain (BSC)", icon: Zap },
  { label: "Total Supply", value: "10,000,000,000 (fixed)", icon: FileCheck2 },
  { label: "Contract", value: "TBA at TGE", icon: Shield },
];

// BDL token allocation — per the Block DAO Label Token Issuance Plan (10B fixed).
const allocation = [
  { cat: "Fan DAO Community", pct: 25, amount: "2,500,000,000" },
  { cat: "Creator DAO", pct: 25, amount: "2,500,000,000" },
  { cat: "Marketing", pct: 15, amount: "1,500,000,000" },
  { cat: "Team (locked · burn-linked)", pct: 10, amount: "1,000,000,000" },
  { cat: "Governance", pct: 10, amount: "1,000,000,000" },
  { cat: "Ecosystem Fund", pct: 10, amount: "1,000,000,000" },
  { cat: "Early Participants", pct: 5, amount: "500,000,000" },
];

const values = [
  {
    icon: Shield,
    title: "Transparency",
    desc: "All smart contracts are public and auditable on BscScan.",
  },
  {
    icon: Globe,
    title: "Community",
    desc: "Built by the community, for the community.",
  },
  {
    icon: Zap,
    title: "Innovation",
    desc: "A rules-based buyback & burn tied to real IP value growth.",
  },
  {
    icon: FileCheck2,
    title: "Security",
    desc: "Multi-audited smart contracts protect every user.",
  },
];

function About() {
  const { t } = useI18n();
  return (
    <Section className="py-12">
      <PageHeader title={t("About {{BRAND}}")} />

      {/* Mission statement */}
      <Card className="bg-gradient-hero">
        <h2 className="text-xl font-semibold mb-3">{t("What is {{BRAND}}?")}</h2>
        <p className="text-base leading-relaxed max-w-3xl">
          {t(
            "{{BRAND}} ({{SYMBOL}}) is the native utility and governance token of the ecosystem, built on BNB Chain (BEP-20). The total supply is fixed at 10,000,000,000 {{SYMBOL}} with no minting capability, and 50% is allocated to the community through the Fan DAO and Creator DAO. Distribution is fully on-chain, transparent, and independently verifiable.",
          )}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            "Rather than an unconditional distribution, {{SYMBOL}} is claimed by verified ecosystem participants who meet corporate DAO and staking conditions. A rules-based buyback & burn — funded by real IP value growth — continuously reduces supply, and the team allocation is locked until the burn milestone is reached.",
          )}
        </p>
      </Card>

      {/* Key Facts */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Key Facts")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((f) => (
          <Card key={f.label}>
            <f.icon className="w-5 h-5 text-[oklch(0.2_0_0)]" />
            <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
              {t(f.label)}
            </div>
            {f.link ? (
              <a
                href={f.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 font-display text-lg font-semibold text-[oklch(0.2_0_0)] hover:underline flex items-center gap-1.5"
              >
                {f.value} <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="mt-2 font-display text-lg font-semibold">
                {f.value}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Token Allocation */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">
        {t("Token Allocation")}
      </h2>
      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {allocation.map((a) => (
            <div key={a.cat} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium">{t(a.cat)}</span>
                <span className="text-muted-foreground tabular-nums">
                  {a.pct}% · {a.amount} {BRAND.symbol}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-gold"
                  style={{ width: `${a.pct * 4}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        {t(
          "50% of supply is community-allocated (Fan DAO + Creator DAO). Team tokens are locked in a Team Vault and released only when the 50% burn milestone is reached, with pro-rata burn applied.",
        )}
      </p>

      {/* Core Values */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Core Values")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {values.map((v) => (
          <Card key={v.title} className="hover-lift">
            <v.icon className="w-6 h-6 text-[oklch(0.2_0_0)]" />
            <h3 className="mt-3 font-semibold">{t(v.title)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t(v.desc)}</p>
          </Card>
        ))}
      </div>

      {/* Team */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Team")}</h2>
      <div className="grid sm:grid-cols-3 gap-4">
        {team.map((m) => (
          <Card key={m.name} className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-gold mx-auto flex items-center justify-center text-gold-foreground font-bold text-lg shadow-gold">
              {m.initials}
            </div>
            <div className="mt-4 font-semibold">{m.name}</div>
            <div className="text-sm text-muted-foreground">{t(m.role)}</div>
          </Card>
        ))}
      </div>

      {/* Resources */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Resources")}</h2>
      <Card>
        <ul className="divide-y divide-border">
          {[
            { name: "Whitepaper", url: "#" },
            { name: "BscScan Contract", url: BSCSCAN_CONTRACT },
            { name: "CertiK Audit Report", url: "#" },
            { name: "Block Label Platform", url: "https://app.blocklabel.vip" },
          ].map((l) => (
            <li key={l.name}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between py-3 hover:text-[oklch(0.2_0_0)]"
              >
                <span>{t(l.name)}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </li>
          ))}
        </ul>
      </Card>


    </Section>
  );
}
