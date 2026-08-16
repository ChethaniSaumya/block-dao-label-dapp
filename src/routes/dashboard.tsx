import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Section,
  Card,
  Badge,
  GoldButton,
  OutlineButton,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import {
  Copy,
  Coins,
  Lock,
  Gift,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from "lucide-react";
import { useAccount, useReadContract, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getTransactions,
  Transaction,
} from "@/services/api";
import {
  ADDR,
  teamLockupAbi,
  erc20Abi,
  BDL_DECIMALS,
} from "@/lib/contracts";

const bdl = (v: bigint | undefined) =>
  v === undefined ? "0" : Number(formatUnits(v, BDL_DECIMALS)).toLocaleString();

// Round 1 flat reward per the whitepaper's Early-Bird tier — used as a dashboard
// estimate; the exact per-wallet claim (with proof) lives on the /airdrop page.
const ROUND1_ESTIMATE = 200_000;

/** Read-only Team Vault / buyback-burn progress (hidden until the vault is deployed). */
function TeamVaultCard() {
  const { t } = useI18n();
  const lockup = ADDR.teamLockup;
  const enabled = !!lockup;
  const q = { enabled } as const;
  const { data: bps } = useReadContract({ address: lockup, abi: teamLockupAbi, functionName: "burnProgressBps", query: q });
  const { data: teamAlloc } = useReadContract({ address: lockup, abi: teamLockupAbi, functionName: "teamAllocation", query: q });
  const { data: teamBurned } = useReadContract({ address: lockup, abi: teamLockupAbi, functionName: "teamAllocationBurned", query: q });
  const { data: remaining } = useReadContract({ address: lockup, abi: teamLockupAbi, functionName: "remainingLockedTeam", query: q });
  const { data: milestone } = useReadContract({ address: lockup, abi: teamLockupAbi, functionName: "milestoneReached", query: q });

  if (!enabled) return null;
  const pct = bps !== undefined ? Number(bps) / 100 : 0;

  return (
    <Card className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{t("Team Vault & Burn")}</h2>
        <Badge variant={milestone ? "success" : "warning"}>
          {milestone ? t("Unlocked (50% burn)") : t("Locked · burn-linked")}
        </Badge>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-muted-foreground">{t("Team Allocation")}</div>
          <div className="font-display text-xl font-semibold mt-1">{bdl(teamAlloc as bigint)} {BRAND.symbol}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t("Team Burned")}</div>
          <div className="font-display text-xl font-semibold mt-1">{bdl(teamBurned as bigint)} {BRAND.symbol}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">{t("Remaining Locked")}</div>
          <div className="font-display text-xl font-semibold mt-1">{bdl(remaining as bigint)} {BRAND.symbol}</div>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{t("Total-supply burn progress")}</span>
          <span>{pct.toFixed(2)}% / 50%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-gold transition-all" style={{ width: `${Math.min(pct * 2, 100)}%` }} />
        </div>
      </div>
    </Card>
  );
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: `Dashboard — ${BRAND.name}` },
      {
        name: "description",
        content: `View ${BRAND.symbol} balance, staking, and recent transactions.`,
      },
    ],
  }),
  component: DashboardPage,
});

const priceData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  price: 0.08 + Math.sin(i / 4) * 0.015 + i * 0.002 + Math.random() * 0.005,
}));

function DashboardPage() {
  return (
    <WalletGuard>
      <Dashboard />
    </WalletGuard>
  );
}

function Dashboard() {
  const { t } = useI18n();
  const { address } = useAccount();
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "—";

  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    if (address) {
      getTransactions(address)
        .then((data) => setTxs(data.slice(0, 5)))
        .catch(console.error);
    }
  }, [address]);

  // All four stats read directly on-chain — works with or without a backend.
  const enabled = !!address;
  const { data: bdlBalance, refetch: refetchBdl, isRefetching: refetchingBdl } = useReadContract({
    address: ADDR.token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: enabled && !!ADDR.token, refetchInterval: 15_000 },
  });

  const { data: bnbBalance, refetch: refetchBnb } = useBalance({
    address,
    query: { enabled, refetchInterval: 15_000 },
  });
  const stats = [
    {
      icon: Wallet,
      label: "{{SYMBOL}} Balance",
      value: bdlBalance !== undefined
        ? Number(formatUnits(bdlBalance as bigint, BDL_DECIMALS)).toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "—",
      suffix: BRAND.symbol,
    },
    {
      icon: Gift,
      label: "Estimated Airdrop",
      value: ROUND1_ESTIMATE.toLocaleString(),
      suffix: BRAND.symbol,
    },
    {
      icon: Coins,
      label: "BNB Balance",
      value: bnbBalance ? Number(formatUnits(bnbBalance.value, 18)).toFixed(4) : "—",
      suffix: "BNB",
    },
  ];

  return (
    <Section className="py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("Dashboard")}
          </h1>
          <button
            onClick={() => {
              if (address) {
                navigator.clipboard?.writeText(address);
                toast("Address copied");
              }
            }}
            className="mt-2 inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground"
          >
            {shortAddress} <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <OutlineButton
            onClick={() => {
              refetchBdl();
              refetchBnb();
              toast.success(t("Refreshed dashboard"));
            }}
            disabled={refetchingBdl}
            className="h-7 text-xs px-3 py-1"
          >
            {refetchingBdl ? t("Refreshing...") : t("Refresh")}
          </OutlineButton>
          <Badge variant="success">● {t("Connected")}</Badge>
          <a
            href={`https://bscscan.com/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[var(--gold-lift)]"
          >
            <ExternalLink className="w-3 h-3" /> BscScan
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <s.icon className="w-5 h-5 text-[var(--gold-lift)]" />
            <div className="mt-3 text-xs text-muted-foreground">
              {t(s.label)}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-2xl font-semibold">
                {s.value}
              </span>
              <span className="text-xs text-muted-foreground">{s.suffix}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Price chart */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{t("Token Price History")}</h2>
          <Badge variant="success">+12.4%</Badge>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {/*
              Single series, so no legend — the card title names it. Grid and
              axes stay recessive; the gold mark carries the identity. Colours
              are literals rather than CSS vars because recharts renders these
              as SVG attributes, which don't resolve var().
            */}
            <AreaChart data={priceData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A24A" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#C8A24A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(200,162,74,0.10)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                stroke="rgba(148,161,184,0.35)"
                tick={{ fill: "#94A1B8", fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="rgba(148,161,184,0.35)"
                tick={{ fill: "#94A1B8", fontSize: 11 }}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${v.toFixed(3)}`}
              />
              <Tooltip
                cursor={{ stroke: "rgba(200,162,74,0.45)", strokeWidth: 1 }}
                contentStyle={{
                  background: "#0E1728",
                  border: "1px solid rgba(200,162,74,0.28)",
                  borderRadius: 8,
                  color: "#ECE4D2",
                }}
                labelStyle={{ color: "#94A1B8" }}
                itemStyle={{ color: "#E9CE86" }}
                formatter={(v: number) => [`$${v.toFixed(4)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#C8A24A"
                strokeWidth={2}
                fill="url(#priceFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#E9CE86",
                  stroke: "#0E1728",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <TeamVaultCard />

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {t("Recent Transactions")}
            </h2>
            <Link
              to="/transactions"
              className="text-xs text-[var(--gold-lift)] hover:underline"
            >
              {t("View All")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 font-medium">{t("Type")}</th>
                  <th className="text-left py-2 font-medium">{t("Amount")}</th>
                  <th className="text-left py-2 font-medium">{t("TX Hash")}</th>
                  <th className="text-left py-2 font-medium">{t("Date")}</th>
                  <th className="text-right py-2 font-medium">{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {txs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No recent transactions.
                    </td>
                  </tr>
                ) : (
                  txs.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 flex items-center gap-2">
                        {tx.amount.startsWith("-") ? (
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-[var(--success)]" />
                        )}
                        {t(tx.type)}
                      </td>
                      <td className="py-3 font-mono">{tx.amount}</td>
                      <td className="py-3">
                        <a
                          href={`https://bscscan.com/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-[var(--gold-lift)]"
                        >
                          {tx.tx_hash.slice(0, 8)}...
                        </a>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
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
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="font-semibold text-lg mb-4">{t("Quick Actions")}</h2>
          <div className="space-y-3">
            {[

              {
                label: "Claim Airdrop",
                desc: "Collect your earned tokens",
                icon: Gift,
                to: "/airdrop",
              },
              {
                label: "Transfer",
                desc: "Send {{SYMBOL}} to another wallet",
                icon: ArrowUpRight,
                to: "/transactions",
              },
            ].map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary hover:border-[rgba(200,162,74,0.30)] transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(200,162,74,0.10)] flex items-center justify-center group-hover:scale-110 transition">
                  <a.icon className="w-5 h-5 text-[var(--gold-lift)]" />
                </div>
                <div>
                  <div className="text-sm font-medium">{t(a.label)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(a.desc)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
