import { createFileRoute, Link } from "@tanstack/react-router";
import {
  LineChart,
  Line,
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
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[oklch(0.2_0_0)]"
          >
            <ExternalLink className="w-3 h-3" /> BscScan
          </a>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <s.icon className="w-5 h-5 text-[oklch(0.2_0_0)]" />
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
            <LineChart data={priceData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.3 0.02 280 / 12%)"
              />
              <XAxis
                dataKey="day"
                stroke="oklch(0.52 0.015 275)"
                fontSize={11}
              />
              <YAxis
                stroke="oklch(0.52 0.015 275)"
                fontSize={11}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `$${v.toFixed(3)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(1 0 0)",
                  border: "1px solid oklch(0.91 0.004 275)",
                  borderRadius: 8,
                  color: "oklch(0.22 0.012 275)",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="oklch(0.2 0 0)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
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
              className="text-xs text-[oklch(0.2_0_0)] hover:underline"
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
                          <ArrowDownLeft className="w-4 h-4 text-[oklch(0.72_0.18_150)]" />
                        )}
                        {t(tx.type)}
                      </td>
                      <td className="py-3 font-mono">{tx.amount}</td>
                      <td className="py-3">
                        <a
                          href={`https://bscscan.com/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-muted-foreground hover:text-[oklch(0.2_0_0)]"
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
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary hover:border-[oklch(0.2_0_0_/_30%)] transition group"
              >
                <div className="w-10 h-10 rounded-lg bg-[oklch(0.2_0_0_/_10%)] flex items-center justify-center group-hover:scale-110 transition">
                  <a.icon className="w-5 h-5 text-[oklch(0.2_0_0)]" />
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
