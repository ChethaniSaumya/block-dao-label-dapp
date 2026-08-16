import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Section, Card, GoldButton, PageHeader, Badge } from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import {
  getAirdropStatus,
  AirdropStatus,
  getAirdropProof,
  AirdropProof,
} from "@/services/api";
import { ADDR, distributorAbi, DEMO_MODE } from "@/lib/contracts";
import { CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/airdrop")({
  head: () => ({
    meta: [
      { title: `Airdrops — ${BRAND.name}` },
      { name: "description", content: `Claim your ${BRAND.symbol} airdrop.` },
    ],
  }),
  component: () => (
    <WalletGuard>
      <Airdrop />
    </WalletGuard>
  ),
});

const ROUNDS = [1, 2, 3, 4];

function Airdrop() {
  const { t } = useI18n();
  const { address } = useAccount();
  const [status, setStatus] = useState<AirdropStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claim, setClaim] = useState<AirdropProof | null>(null);

  const { writeContract, data: hash, isPending, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  // Find the user's Merkle claim. Demo mode reads a static /demo-round1.json
  // (no backend needed); production hits the backend proof endpoint per round.
  const findClaim = useCallback(async (addr: string) => {
    if (DEMO_MODE) {
      try {
        const res = await fetch("/demo-round1.json");
        if (res.ok) {
          const data = await res.json();
          const e = data.entries?.[addr.toLowerCase()];
          if (e) return { round: data.round, ...e } as AirdropProof;
        }
      } catch {
        /* fall through */
      }
      return null;
    }
    for (const round of ROUNDS) {
      try {
        const proof = await getAirdropProof(round, addr);
        if (proof) return proof;
      } catch {
        /* 404 for this round — try next */
      }
    }
    return null;
  }, []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    setLoading(true);
    // Independent lookups: in demo mode there is no backend, so the status call
    // is skipped rather than allowed to fail the whole load (Promise.all would
    // otherwise drop a perfectly good claim just because the backend is down).
    Promise.allSettled([
      DEMO_MODE ? Promise.resolve(null) : getAirdropStatus(address),
      findClaim(address),
    ]).then(([statusResult, claimResult]) => {
      if (cancelled) return;
      setStatus(statusResult.status === "fulfilled" ? statusResult.value : null);
      setClaim(claimResult.status === "fulfilled" ? claimResult.value : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [address, findClaim]);

  useEffect(() => {
    if (confirmed) {
      toast.success(t("Airdrop claimed"));
      reset();
    }
  }, [confirmed, reset, t]);



  const distReady = !!ADDR.distributor;
  const busy = isPending || confirming;

  const handleClaim = () => {
    if (!claim || !ADDR.distributor || !address) return;
    writeContract(
      {
        address: ADDR.distributor,
        abi: distributorAbi,
        functionName: "claim",
        args: [
          BigInt(claim.round),
          BigInt(claim.index),
          claim.account as `0x${string}`,
          BigInt(claim.amount),
          claim.proof,
        ],
      },
      {
        onError: (e) =>
          toast.error(t("Claim failed"), { description: e.message.slice(0, 120) }),
      },
    );
  };

  const eligible = status?.eligible ?? (DEMO_MODE ? !!claim : !!claim);
  const lockDays = status?.remainingLockSeconds
    ? Math.ceil(Number(status.remainingLockSeconds) / 86400)
    : null;

  return (
    <Section className="py-12">
      <PageHeader
        title={t("Airdrop Claims")}
        subtitle={t(
          "Verified participants claim {{SYMBOL}} through an open Merkle distributor — pull-based, on-chain, no batch transfers.",
        )}
      />

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          {/* Claim card */}
          <Card ornament>
            <div className="eyebrow mb-5">{t("Your Claim")}</div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-muted-foreground text-sm">
                  {claim ? t("Claimable Now") : t("Estimated Reward")}
                </div>
                <div className="font-engraved text-3xl font-medium mt-1.5 foil">
                  {loading
                    ? "..."
                    : claim
                      ? Number(formatEther(BigInt(claim.amount))).toLocaleString()
                      : (status?.rewardAmount || (DEMO_MODE && eligible ? 200000 : 0)).toLocaleString()}{" "}
                  {BRAND.symbol}
                </div>
              </div>
              <Badge variant={eligible ? "success" : "warning"}>
                {eligible ? t("Qualified") : t("Pending")}
              </Badge>
            </div>

            <hr className="rule-gold my-6" />

            <div>
              {!distReady ? (
                <div className="text-xs text-muted-foreground">
                  {t("Airdrop distributor not deployed yet.")}
                </div>
              ) : claim ? (
                <GoldButton
                  onClick={handleClaim}
                  disabled={busy}
                  className="w-full"
                >
                  {busy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {confirming ? t("Confirming...") : t("Claiming...")}
                    </>
                  ) : (
                    `${t("Claim")} ${BRAND.symbol}`
                  )}
                </GoldButton>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {eligible
                    ? t("You're eligible — your round allocation opens soon.")
                    : t("Wait for verification to qualify.")}
                </div>
              )}
            </div>
          </Card>

          {/* Eligibility criteria (whitepaper) */}
          <Card>
            <h3 className="font-semibold mb-4">{t("Eligibility Criteria")}</h3>
            <ul className="space-y-3">
              {[
                { label: "Wallet connected to BNB Chain", done: true },
                {
                  label: "Purchaser verification confirmed",
                  done: eligible,
                },
                {
                  label: "Corporate DAO account / referral connected",
                  done: eligible,
                },
              ].map((c, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${c.done ? "bg-[var(--success)] text-white" : "bg-muted text-muted-foreground"}`}
                  >
                    {c.done ? "✓" : ""}
                  </div>
                  <span className={c.done ? "text-foreground" : "text-muted-foreground"}>
                    {t(c.label)}
                  </span>
                </li>
              ))}
            </ul>
            {lockDays !== null && lockDays > 0 && (
              <div className="mt-4 text-xs text-muted-foreground">
                {t("Lock remaining")}: {lockDays} {t("days")}
              </div>
            )}
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">{t("How Airdrops Work")}</h2>
          <Card>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {t(
                "Eligibility is verified manually off-chain, then included in a round's Merkle tree. You claim your allocation directly from the distributor contract — the project never batch-sends tokens, so timing and custody stay with you.",
              )}
            </p>
            {confirmed && (
              <div className="mt-4 flex items-center gap-2 text-sm text-[var(--success)]">
                <CheckCircle2 className="w-4 h-4" /> {t("Claim confirmed on-chain.")}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
}
