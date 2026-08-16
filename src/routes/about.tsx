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
import {
  ExternalLink,
  Shield,
  FileCheck2,
  Zap,
  Globe,
  Music2,
  Settings2,
  Users,
  Check,
  Info,
  Layers,
  Blocks,
  Share2,
} from "lucide-react";

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

const facts: {
  label: string;
  value: string;
  icon: typeof FileCheck2;
  link?: string;
}[] = [
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

// Source: About.pdf (client-supplied, F:\Fiverr V2\minell7182_2026\Pages),
// transcribed verbatim.
const pillars = [
  {
    icon: Music2,
    title: "Artist First",
    body: "We fundamentally reform unfair contracts and opaque settlement structures so artists can focus solely on creation. Standardized contract guidelines, smart-contract-based automatic settlement, and end-to-end management support meaningfully protect artists' rights and revenue.",
    checklist: [
      "Standardized fair contracts",
      "Smart-contract auto settlement",
      "Full-spectrum creative support",
    ],
  },
  {
    icon: Settings2,
    title: "Tech Innovation",
    body: "We combine AI production pipelines with blockchain infrastructure to remove inefficiency from the content industry. AI-driven planning, production, and post-production cut costs by up to 90%, while on-chain copyright registration and IP valuation systems objectively certify the value of every work.",
    checklist: [
      "AI hybrid production",
      "On-chain copyright protection",
      "AI-driven IP valuation",
    ],
  },
  {
    icon: Users,
    title: "Fan Participation",
    body: "We redefine fans as co-creators of the ecosystem rather than mere consumers. Through Fan DAO governance, fans directly participate in artist curation, content planning, and IP strategy, and earn rewards proportional to their contribution—building a new fandom economy.",
    checklist: [
      "Fan DAO governance voting",
      "Participatory content planning",
      "Contribution-based rewards",
    ],
  },
  {
    icon: Globe,
    title: "Global Expansion",
    body: "Leveraging the global competitiveness of K-content, we deploy music, short dramas, and transmedia IPs simultaneously across international OTT platforms, global film festivals, and overseas licensing channels. Multilingual localization and blockchain-based global settlement enable a borderless IP business.",
    checklist: [
      "Simultaneous global OTT distribution",
      "Multilingual localization",
      "Borderless on-chain settlement",
    ],
  },
];

const bscPoints = [
  {
    icon: Layers,
    title: "BEP-20 standard token issuance",
    body: "Issuing the BDL token under the BSC standard ensures broad compatibility and liquidity.",
  },
  {
    icon: Blocks,
    title: "Entertainment dApp reference",
    body: "AI content production, IP protection, and Fan DAOs expand real-world use cases within the BSC ecosystem.",
  },
  {
    icon: Share2,
    title: "Operated on BSC infrastructure",
    body: "Smart contracts, DAOs, and airdrops are executed transparently and efficiently on top of BSC.",
  },
];

const partners = [
  {
    name: "MUSEEDLE",
    body: "AI-generated works marketplace & music publishing company",
  },
  {
    name: "DASA",
    body: "Decentralized Assessment & Standards Authority — a decentralized review and certification standards platform",
  },
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

      {/* Four pillars — About.pdf */}
      <p className="mt-8 text-sm italic text-center text-muted-foreground max-w-xl mx-auto">
        {t(
          "“Building a healthy entertainment ecosystem where technology and art harmonize.”",
        )}
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        {pillars.map((p) => (
          <Card key={p.title}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                <p.icon className="w-4.5 h-4.5 text-gold-lift" />
              </div>
              <h3 className="font-semibold text-base">{t(p.title)}</h3>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {t(p.body)}
            </p>
            <hr className="rule-gold my-4" />
            <ul className="space-y-1.5">
              {p.checklist.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm">
                  <Check className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span>{t(c)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* BSC ecosystem contribution — About.pdf */}
      <Card className="mt-8" ornament>
        <div className="eyebrow mb-2">{t("BSC Ecosystem Contribution")}</div>
        <h2 className="font-engraved text-xl md:text-2xl font-medium max-w-lg">
          {t("Contributing to the Binance Smart Chain ecosystem")}
        </h2>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-3xl">
          {t(
            "The BDL token is a BEP-20 asset issued on the BSC (Binance Smart Chain) network. Block Label leverages BSC's high throughput, low fees, and proven security to bring entertainment IP and the fan economy on-chain — contributing to the expansion of real-world use cases within the BSC ecosystem.",
          )}
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {bscPoints.map((b) => (
            <div key={b.title} className="p-4 rounded-lg tile">
              <b.icon className="w-4.5 h-4.5 text-gold-lift" />
              <div className="mt-2.5 text-sm font-semibold">{t(b.title)}</div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {t(b.body)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2.5 text-xs text-muted-foreground p-3 rounded-md bg-secondary">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            {t(
              "This is an independent project built on the BSC (Binance Smart Chain) network. While we currently have no capital or equity ties with Binance or its affiliates, we are actively pursuing strategic collaborations and partnerships with projects across the BSC ecosystem going forward.",
            )}
          </p>
        </div>
      </Card>

      {/* Partners & Ecosystem — About.pdf */}
      <div className="mt-12 text-center">
        <div className="eyebrow">{t("Partners & Ecosystem")}</div>
        <h2 className="mt-2 font-engraved text-xl md:text-2xl font-medium">
          {t("Partners & Ecosystem Projects")}
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          {t(
            "Block Label collaborates with diverse partners and ecosystem projects to create synergy between content IP and blockchain technology.",
          )}
        </p>
      </div>
      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        {partners.map((p) => (
          <Card key={p.name} className="text-center">
            <div className="font-engraved text-lg font-medium">{p.name}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t(p.body)}</p>
          </Card>
        ))}
      </div>

      {/* Key Facts */}
      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Key Facts")}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {facts.map((f) => (
          <Card key={f.label}>
            <f.icon className="w-5 h-5 text-[var(--gold-lift)]" />
            <div className="mt-3 text-xs text-muted-foreground uppercase tracking-wider">
              {t(f.label)}
            </div>
            {f.link ? (
              <a
                href={f.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 font-display text-lg font-semibold text-[var(--gold-lift)] hover:underline flex items-center gap-1.5"
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
            <v.icon className="w-6 h-6 text-[var(--gold-lift)]" />
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
                className="flex items-center justify-between py-3 hover:text-[var(--gold-lift)]"
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
