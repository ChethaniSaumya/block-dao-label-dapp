import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  adminAirdrop,
  getAdminLogs,
  getEligibilityList,
  adminBulkAirdrop,
  getContractStatus,
  togglePause,
  AdminLog,
  UserEligibility,
} from "@/services/api";
import {
  Section,
  Card,
  GoldButton,
  OutlineButton,
  PageHeader,
  Badge,
} from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { ShieldAlert, RefreshCw, Send, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: `Admin — ${BRAND.name}` }] }),
  component: () => (
    <WalletGuard>
      <Admin />
    </WalletGuard>
  ),
});

const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_WALLET_ADDRESS || "PENDING";

function Admin() {
  const { t } = useI18n();
  const { address } = useAccount();
  const { isAuthenticated } = useAuthStore();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [eligibility, setEligibility] = useState<UserEligibility[]>([]);
  const [ignoredAddresses, setIgnoredAddresses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Form states
  const [airdropTo, setAirdropTo] = useState("");
  const [airdropAmount, setAirdropAmount] = useState("");

  const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const [paused, setPaused] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);

  const fetchAdminData = async () => {
    if (!isAdmin || !isAuthenticated) return;
    setLoading(true);
    try {
      const [logsData, eligibilityData, statusData] = await Promise.all([
        getAdminLogs(),
        getEligibilityList(),
        getContractStatus()
      ]);
      setLogs(logsData);
      setEligibility(eligibilityData);
      setPaused(statusData.paused);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && isAuthenticated) {
      fetchAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, isAuthenticated]);

  const handleScan = async () => {
    if (!isAuthenticated) {
      toast.error("Please verify your session first.");
      return;
    }
    setScanning(true);
    try {
      const data = await getEligibilityList();
      setEligibility(data);
      toast.success("Eligibility list updated");
    } catch (err) {
      toast.error("Failed to refresh list");
    } finally {
      setScanning(false);
    }
  };

  const toggleIgnore = (addr: string) => {
    const next = new Set(ignoredAddresses);
    if (next.has(addr)) next.delete(addr);
    else next.add(addr);
    setIgnoredAddresses(next);
  };

  const handleTogglePause = async () => {
    if (!confirm(`Are you sure you want to ${paused ? "Unpause" : "Pause"} the contract?`)) return;
    setTogglingPause(true);
    try {
      const targetState = !paused;
      const { txHash } = await togglePause(targetState);
      toast.success(`Contract ${targetState ? "Paused" : "Unpaused"}`, {
        description: `TX: ${txHash.slice(0, 8)}...`
      });
      setPaused(targetState);
      fetchAdminData();
    } catch (err: any) {
      toast.error("Failed to toggle pause: " + err.message);
    } finally {
      setTogglingPause(false);
    }
  };

  const handleIndividualAirdrop = async (recipient: UserEligibility) => {
    try {
      const { txHash } = await adminAirdrop(recipient.address, recipient.rewardAmount.toString());
      toast.success(`Sent ${recipient.rewardAmount} ${BRAND.symbol} to ${recipient.address.slice(0, 6)}`);
      fetchAdminData();
    } catch (err: any) {
      toast.error("Individual airdrop failed: " + err.message);
    }
  };

  const handleSendAll = async () => {
    const targets = eligibility.filter(e => 
      e.eligible && 
      e.rewardAmount > 0 && 
      !e.distributed &&
      !ignoredAddresses.has(e.address)
    );
    
    if (targets.length === 0) {
      toast.info("No pending eligible wallets to process");
      return;
    }

    if (!confirm(`Are you sure you want to send airdrops to ${targets.length} wallets?`)) return;

    setProcessingBulk(true);
    try {
      const recipients = targets.map(t => ({ address: t.address, amount: t.rewardAmount }));
      const { results } = await adminBulkAirdrop(recipients);
      
      const successCount = results.filter(r => r.status === "Success").length;
      toast.success(`Bulk airdrop complete: ${successCount} successful`);
      fetchAdminData();
    } catch (err: any) {
      toast.error("Bulk process failed: " + err.message);
    } finally {
      setProcessingBulk(false);
    }
  };

  if (!isAdmin) {
    return (
      <Section className="py-20">
        <Card className="max-w-md mx-auto text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("Access Denied")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("Only the owner wallet can access this panel.")}
          </p>
          <div className="text-[10px] text-muted-foreground p-3 bg-secondary rounded-md text-left font-mono space-y-1">
            <div>Your Address: {address || "Not connected"}</div>
            <div>Expected Admin: {ADMIN_ADDRESS}</div>
          </div>
        </Card>
      </Section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Section className="py-20">
        <Card className="max-w-md mx-auto text-center p-8 border-gold/50">
          <RefreshCw className="w-12 h-12 mx-auto text-gold mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Required</h2>
          <p className="text-muted-foreground mb-6">
            For security, you must verify your session with a signature to access Admin data.
          </p>
          <GoldButton onClick={() => window.location.reload()}>
            Click here to verify & refresh
          </GoldButton>
        </Card>
      </Section>
    );
  }

  const [triggering, setTriggering] = useState(false);

  const handleAirdrop = async () => {
    if (!airdropTo || !airdropAmount) return;
    setTriggering(true);
    try {
      const { txHash } = await adminAirdrop(airdropTo, airdropAmount);
      toast.success("Airdrop executed successfully", {
        description: `TX: ${txHash.slice(0, 8)}...`,
      });
      setAirdropTo("");
      setAirdropAmount("");
      // REFRESH ENTIRE STATE
      fetchAdminData();
    } catch (err: any) {
      const msg = err.message || "Airdrop failed";
      if (msg.includes("already processed")) {
        toast.warning("Blocked: This wallet already received an airdrop.");
      } else {
        toast.error(msg);
      }
    } finally {
      setTriggering(false);
    }
  };

  return (
    <Section className="py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {t("Owner Panel")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <OutlineButton onClick={handleScan} disabled={scanning}>
            <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            Refresh List
          </OutlineButton>
          <Badge variant="warning">{t("OWNER ACCESS")}</Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Advanced Airdrop Queue */}
        <Card className="border-gold/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Airdrop Distribution Queue</h2>
              <p className="text-sm text-muted-foreground mt-1">Review eligible wallets before processing distributions.</p>
            </div>
            <GoldButton 
              onClick={handleSendAll} 
              disabled={processingBulk || eligibility.filter(e => e.eligible && !e.distributed && !ignoredAddresses.has(e.address)).length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              {processingBulk ? "Processing..." : "Send All Eligible"}
            </GoldButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-3 font-medium">Wallet</th>
                  <th className="text-left py-3 font-medium">Block Label Staked</th>
                  <th className="text-left py-3 font-medium">Eligible</th>
                  <th className="text-left py-3 font-medium">{BRAND.symbol} Reward</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eligibility.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground italic">No users found in database.</td>
                  </tr>
                ) : (
                  eligibility.map((item) => (
                    <tr key={item.address} className={`border-b border-border/50 transition-opacity ${ignoredAddresses.has(item.address) ? 'opacity-40 grayscale' : ''}`}>
                      <td className="py-4">
                        <div className="font-mono">{item.address.slice(0, 8)}...{item.address.slice(-6)}</div>
                        <div className="text-[10px] text-muted-foreground">{item.name || 'Anonymous User'}</div>
                      </td>
                      <td className="py-4 font-medium">{item.webKeyBalance.toLocaleString()} WK</td>
                      <td className="py-4">
                        {item.distributed ? (
                          <span className="flex items-center text-success text-xs font-medium bg-success/10 px-2 py-1 rounded w-fit">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Distributed
                          </span>
                        ) : item.eligible ? (
                          <span className="flex items-center text-gold text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Qualified
                          </span>
                        ) : (
                          <span className="flex items-center text-muted-foreground text-xs font-medium">
                            <XCircle className="w-3 h-3 mr-1" /> Not Qualified
                          </span>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="font-display font-semibold text-gold">+{item.rewardAmount} {BRAND.symbol}</span>
                      </td>
                      <td className="py-4 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleIgnore(item.address)}
                          title={ignoredAddresses.has(item.address) ? "Restore" : "Ignore"}
                          className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          disabled={item.distributed}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <OutlineButton 
                          size="sm" 
                          disabled={!item.eligible || item.distributed || ignoredAddresses.has(item.address)}
                          onClick={() => handleIndividualAirdrop(item)}
                        >
                          {item.distributed ? "Sent" : "Send"}
                        </OutlineButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <h2 className="font-semibold mb-4">{t("Token Controls")}</h2>
            <div className="space-y-4">
              <div className="rounded-md bg-secondary/50 border border-border px-3 py-2 text-xs text-muted-foreground">
                {t(
                  "{{SYMBOL}} is fixed-supply (no mint). Distributions are sent from the treasury or claimed via the airdrop distributor.",
                )}
              </div>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <div className="text-sm">{t("Pause Contract")}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Status:{" "}
                    <Badge
                      variant={paused ? "destructive" : "success"}
                      className="ml-1 scale-90"
                    >
                      {paused ? t("Paused") : t("Active")}
                    </Badge>
                  </div>
                </div>
                <OutlineButton onClick={handleTogglePause} disabled={togglingPause}>
                  {togglingPause ? "..." : paused ? "Unpause" : "Pause"}
                </OutlineButton>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold mb-4">{t("Manual Override")}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="text-xs text-muted-foreground">
                    {t("Next Airdrop Date")}
                  </div>
                  <div className="font-semibold mt-1">May 15, 2026</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <div className="text-xs text-muted-foreground">
                    {t("Minimum Staking Required")}
                  </div>
                  <div className="font-semibold mt-1">15,000 Block Label</div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">
                  {t("Individual Overwrite")}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Target Wallet 0x..."
                    value={airdropTo}
                    onChange={(e) => setAirdropTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={t("Amount ({{SYMBOL}})")}
                      value={airdropAmount}
                      onChange={(e) => setAirdropAmount(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md bg-input border border-border text-sm"
                    />
                    <GoldButton onClick={handleAirdrop} disabled={triggering}>
                      {triggering ? "Triggering..." : t("Trigger Airdrop")}
                    </GoldButton>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <h2 className="mt-12 mb-4 text-xl font-semibold">{t("Admin Logs")}</h2>
      <Card>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 font-medium">{t("Action")}</th>
                  <th className="text-left py-2 font-medium">{t("Wallet")}</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-right py-2 font-medium">TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No admin actions recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3">{t(log.action)}</td>
                      <td className="py-3 font-mono">
                        {log.target_address
                          ? `${log.target_address.slice(0, 6)}...${log.target_address.slice(-4)}`
                          : "—"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right font-mono">
                        {log.tx_hash ? (
                          <a
                            href={`https://bscscan.com/tx/${log.tx_hash}`}
                            target="_blank"
                            className="hover:underline text-[oklch(0.2_0_0)]"
                          >
                            {log.tx_hash.slice(0, 8)}...
                          </a>
                        ) : (
                          "—"
                        )}
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



