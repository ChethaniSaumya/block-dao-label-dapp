import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { isAddress } from "viem";
import { toast } from "sonner";
import {
  Award,
  ShieldAlert,
  RefreshCw,
  Send,
  ExternalLink,
  Lock,
  Users,
  PauseCircle,
  PlayCircle,
  Percent,
  Link2,
  Hash,
  Layers,
  Tag,
  TrendingDown,
  Plus,
  Trash2,
} from "lucide-react";
import { Section, Card, Badge, GoldButton, OutlineButton } from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import {
  CERTIFICATE_NFT,
  NFT_WALLETS,
  certificateNftAbi,
  MAX_BATCH_PER_TX,
  ROLE,
  EXPLORER,
  resolveRounds,
  type OnChainRound,
  type ResolvedRound,
} from "@/lib/nft";

export const Route = createFileRoute("/nft-admin")({
  head: () => ({ meta: [{ title: `NFT Operations — ${BRAND.name}` }] }),
  component: () => (
    <WalletGuard>
      <NftAdmin />
    </WalletGuard>
  ),
});

const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—");

/** Text input matching the styling used across the admin panels. */
function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full px-3 py-2 rounded-md bg-input border border-border text-sm font-mono disabled:opacity-50"
      />
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="p-4 rounded-lg tile">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-display text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

/** One row of the serial table; reads its own current holder. */
function CertificateRow({
  tokenId,
  nft,
  serial,
  round,
}: {
  tokenId: bigint;
  nft: `0x${string}`;
  serial: string;
  round?: ResolvedRound;
}) {
  const { data: holder } = useReadContract({
    address: nft,
    abi: certificateNftAbi,
    functionName: "ownerOf",
    args: [tokenId],
  });

  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className="py-3 font-mono">{serial}</td>
      <td className="py-3">
        <Badge variant="muted">R{round?.round ?? "—"}</Badge>
      </td>
      <td className="py-3 text-right font-mono">
        {holder ? (
          <a
            href={`${EXPLORER}/address/${holder}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {short(holder as string)}
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

function NftAdmin() {
  const { t } = useI18n();
  const { address } = useAccount();
  const nft = CERTIFICATE_NFT;

  const enabled = !!nft;
  const q = { enabled } as const;
  const base = { address: nft, abi: certificateNftAbi } as const;

  // ── Live contract state ───────────────────────────────────────────────
  const { data: totalIssued, refetch: refetchIssued } = useReadContract({ ...base, functionName: "totalIssued", query: q });
  const { data: totalSupply, refetch: refetchSupply } = useReadContract({ ...base, functionName: "totalSupply", query: q });
  const { data: nextId, refetch: refetchNext } = useReadContract({ ...base, functionName: "nextTokenId", query: q });
  const { data: maxSupply, refetch: refetchMax } = useReadContract({ ...base, functionName: "maxSupply", query: q });
  const { data: highestIssued, refetch: refetchHighest } = useReadContract({ ...base, functionName: "highestIssuedSerial", query: q });
  const { data: paused, refetch: refetchPaused } = useReadContract({ ...base, functionName: "paused", query: q });
  const { data: baseUri, refetch: refetchBaseUri } = useReadContract({ ...base, functionName: "baseURI", query: q });
  const { data: frozen, refetch: refetchFrozen } = useReadContract({ ...base, functionName: "metadataFrozen", query: q });
  const { data: royalty, refetch: refetchRoyalty } = useReadContract({ ...base, functionName: "royaltyInfo", args: [1n, 10_000n], query: q });
  const { data: royaltyCap, refetch: refetchCap } = useReadContract({ ...base, functionName: "maxRoyaltyBps", query: q });
  const { data: collectionName, refetch: refetchName } = useReadContract({ ...base, functionName: "name", query: q });
  const { data: collectionSymbol, refetch: refetchSymbol } = useReadContract({ ...base, functionName: "symbol", query: q });
  const { data: prefix, refetch: refetchPrefix } = useReadContract({ ...base, functionName: "serialPrefix", query: q });
  const { data: padding, refetch: refetchPadding } = useReadContract({ ...base, functionName: "serialPadding", query: q });
  const { data: chainRounds, refetch: refetchRounds } = useReadContract({ ...base, functionName: "getRounds", query: q });

  const { data: isMinter } = useReadContract({
    ...base,
    functionName: "hasRole",
    args: [ROLE.minter, address as `0x${string}`],
    query: { enabled: enabled && !!address },
  });
  const { data: isAdmin } = useReadContract({
    ...base,
    functionName: "hasRole",
    args: [ROLE.admin, address as `0x${string}`],
    query: { enabled: enabled && !!address },
  });

  const refetchAll = () => {
    refetchIssued();
    refetchSupply();
    refetchNext();
    refetchMax();
    refetchHighest();
    refetchPaused();
    refetchBaseUri();
    refetchFrozen();
    refetchRoyalty();
    refetchCap();
    refetchName();
    refetchSymbol();
    refetchPrefix();
    refetchPadding();
    refetchRounds();
  };

  const { writeContractAsync, isPending } = useWriteContract();
  const [lastTx, setLastTx] = useState<`0x${string}` | undefined>();
  const { isLoading: confirming } = useWaitForTransactionReceipt({
    hash: lastTx,
    query: { enabled: !!lastTx },
  });

  /**
   * wagmi infers write arguments from the ABI only under `strict: true`; this
   * project compiles with strict off (tsconfig.app.json), so the generic
   * degrades to one that demands `chain` / `account`. The narrowed alias keeps
   * the call sites honest about what the contract actually accepts.
   */
  const write = writeContractAsync as unknown as (args: {
    address: `0x${string}`;
    abi: typeof certificateNftAbi;
    functionName: string;
    args?: readonly unknown[];
  }) => Promise<`0x${string}`>;

  /** Sends a write and surfaces the result as a toast; refreshes reads after. */
  const send = async (label: string, call: () => Promise<`0x${string}`>) => {
    try {
      const hash = await call();
      setLastTx(hash);
      toast.success(`${label} submitted`, { description: `${hash.slice(0, 10)}…` });
      // Reads settle a moment after the receipt lands.
      setTimeout(refetchAll, 4000);
      return hash;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`${label} failed`, { description: msg.split("\n")[0].slice(0, 160) });
      return undefined;
    }
  };

  // ── Derived values ────────────────────────────────────────────────────
  const issued = Number(totalIssued ?? 0n);
  const cap = Number(maxSupply ?? 0n);
  const burned = issued - Number(totalSupply ?? 0n);
  const rounds = useMemo(
    () => resolveRounds(chainRounds as readonly OnChainRound[] | undefined),
    [chainRounds],
  );

  /** Formats a serial with the collection's CURRENT on-chain format. */
  const fmtSerial = (id: number | bigint) =>
    `${(prefix as string) ?? "BLDAO-"}${String(id).padStart(Number(padding ?? 6), "0")}`;

  const nextSerialId = Number(nextId ?? 0n);
  const nextSerial = nextSerialId > 0 ? fmtSerial(nextSerialId) : t("sold out");
  const royaltyPctCurrent = royalty ? Number((royalty as [string, bigint])[1]) / 100 : undefined;
  const royaltyTo = royalty ? (royalty as [string, bigint])[0] : undefined;
  const capPct = royaltyCap !== undefined ? Number(royaltyCap) / 100 : 10;

  // Serials counting down from the highest one issued. With out-of-order
  // issuance this is "top of the range", not strict chronological order —
  // exact history lives in the CertificateIssued event log.
  const recentIds = useMemo(() => {
    const top = Number(highestIssued ?? 0n);
    const ids: bigint[] = [];
    for (let i = top; i > 0 && ids.length < 8; i--) ids.push(BigInt(i));
    return ids;
  }, [highestIssued]);

  // ── Issuance form state ───────────────────────────────────────────────
  const [buyer, setBuyer] = useState("");
  const [exactBuyer, setExactBuyer] = useState("");
  const [exactSerial, setExactSerial] = useState("");
  const [batchText, setBatchText] = useState("");
  const [reserveTo, setReserveTo] = useState("");
  const [reserveQty, setReserveQty] = useState("");

  const batchAddresses = useMemo(
    () =>
      batchText
        .split(/[\s,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    [batchText],
  );
  const invalidBatch = batchAddresses.filter((a) => !isAddress(a));

  // ── Settings form state ───────────────────────────────────────────────
  const [newBaseUri, setNewBaseUri] = useState("");
  const [royaltyReceiver, setRoyaltyReceiver] = useState("");
  const [royaltyPct, setRoyaltyPct] = useState("5");
  const [roleAddress, setRoleAddress] = useState("");
  const [newName, setNewName] = useState("");
  const [newSymbol, setNewSymbol] = useState("");
  const [newPrefix, setNewPrefix] = useState("");
  const [newPadding, setNewPadding] = useState("");
  const [newCap, setNewCap] = useState("");
  const [newRoyaltyCap, setNewRoyaltyCap] = useState("");
  const [roundDraft, setRoundDraft] = useState<{ from: string; to: string; bdl: string }[]>([]);

  // Seed the editable forms from chain state once it arrives.
  useEffect(() => {
    if (collectionName && !newName) setNewName(collectionName as string);
    if (collectionSymbol && !newSymbol) setNewSymbol(collectionSymbol as string);
    if (prefix !== undefined && !newPrefix) setNewPrefix(prefix as string);
    if (padding !== undefined && !newPadding) setNewPadding(String(padding));
    if (royaltyCap !== undefined && !newRoyaltyCap) {
      setNewRoyaltyCap(String(Number(royaltyCap) / 100));
    }
  }, [collectionName, collectionSymbol, prefix, padding, royaltyCap]);

  useEffect(() => {
    if (rounds.length && roundDraft.length === 0) {
      setRoundDraft(
        rounds.map((r) => ({ from: String(r.from), to: String(r.to), bdl: String(r.bdlAirdrop) })),
      );
    }
  }, [rounds]);

  // ── Guards ────────────────────────────────────────────────────────────
  if (!nft) {
    return (
      <Section className="py-20">
        <Card className="max-w-xl mx-auto text-center">
          <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("Certificate contract not configured")}</h2>
          <p className="text-muted-foreground text-sm">
            {t(
              "Deploy the collection, then set VITE_CERTIFICATE_NFT_ADDRESS in the environment to enable this console.",
            )}
          </p>
          <div className="mt-6 text-left text-[11px] font-mono bg-secondary rounded-md p-3 space-y-1">
            <div>cd contracts</div>
            <div>npm run nft:metadata &amp;&amp; npm run nft:pin</div>
            <div>npm run nft:deploy:testnet</div>
          </div>
        </Card>
      </Section>
    );
  }

  if (!isMinter && !isAdmin) {
    return (
      <Section className="py-20">
        <Card className="max-w-lg mx-auto text-center">
          <ShieldAlert className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("Access Denied")}</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            {t(
              "This console is limited to the operations wallet (issuance) and the Safe multisig (configuration).",
            )}
          </p>
          <div className="text-[11px] text-muted-foreground p-3 bg-secondary rounded-md text-left font-mono space-y-1">
            <div>Connected : {address || "—"}</div>
            <div>Operations: {NFT_WALLETS.ops || "not configured"}</div>
            <div>Safe      : {NFT_WALLETS.safe || "not configured"}</div>
          </div>
        </Card>
      </Section>
    );
  }

  const busy = isPending || confirming;
  const exactSerialNum = Number(exactSerial);
  const exactSerialValid =
    Number.isInteger(exactSerialNum) && exactSerialNum >= 1 && exactSerialNum <= cap;

  return (
    <Section className="py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="eyebrow mb-1.5">{t("Issuing Authority")}</div>
          <h1 className="font-engraved text-3xl font-medium">
            {t("NFT Certificate Operations")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {(collectionName as string) || "Creator DAO Certificate"}{" "}
            <span className="font-mono">({(collectionSymbol as string) || "—"})</span> ·{" "}
            <a
              href={`${EXPLORER}/token/${nft}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono hover:underline inline-flex items-center gap-1"
            >
              {short(nft)} <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <OutlineButton onClick={refetchAll} className="px-4 py-2">
            <RefreshCw className="w-4 h-4" /> {t("Refresh")}
          </OutlineButton>
          {paused ? (
            <Badge variant="warning">{t("PAUSED")}</Badge>
          ) : (
            <Badge variant="success">{t("ACTIVE")}</Badge>
          )}
          <Badge variant="muted">{isAdmin ? t("SAFE ADMIN") : t("OPERATIONS")}</Badge>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label={t("Issued")}
          value={issued.toLocaleString()}
          sub={`of ${cap.toLocaleString()}`}
        />
        <StatTile
          label={t("Remaining")}
          value={(cap - issued).toLocaleString()}
          sub={t("cap is lowerable only")}
        />
        <StatTile label={t("Next Serial")} value={nextSerial} sub={t("used by sequential issue")} />
        <StatTile
          label={t("Held by Owners")}
          value={Number(totalSupply ?? 0n).toLocaleString()}
          sub={burned > 0 ? `${burned} ${t("burned")}` : t("none burned")}
        />
      </div>

      {/* ── Round progress ────────────────────────────────────────────── */}
      <Card className="mt-6">
        <h2 className="font-semibold mb-4">{t("Issuance Rounds")}</h2>
        <div className="space-y-4">
          {rounds.map((r) => {
            const size = r.to - r.from + 1;
            const done = Math.min(Math.max(issued - r.from + 1, 0), size);
            const pct = (done / size) * 100;
            return (
              <div key={r.round}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">
                    Round {r.round}{" "}
                    <span className="text-muted-foreground font-mono text-xs">
                      {fmtSerial(r.from)} … {fmtSerial(r.to)}
                    </span>
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {done.toLocaleString()} / {size.toLocaleString()} ·{" "}
                    {r.bdlAirdrop.toLocaleString()} {BRAND.symbol} {t("each")}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-gold" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-[11px] text-muted-foreground">
          {t(
            "Progress assumes sequential issuance; serials issued out of order are not reflected in the bars.",
          )}
        </p>
      </Card>

      {/* ── Issuance ──────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <Card className={isMinter ? "border-gold/30" : ""}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold">{t("Issue to a Buyer")}</h2>
            <Badge variant="muted">MINTER_ROLE</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {t("Run this once the card / PG payment for the order is confirmed.")}
          </p>
          <div className="space-y-3">
            <Field
              label={t("Buyer BSC wallet")}
              placeholder="0x…"
              value={buyer}
              onChange={(e) => setBuyer(e.target.value)}
              disabled={!isMinter}
              hint={
                buyer && !isAddress(buyer)
                  ? t("Not a valid BSC address")
                  : `${t("Will issue")} ${nextSerial}`
              }
            />
            <GoldButton
              className="w-full"
              disabled={!isMinter || busy || !isAddress(buyer) || !!paused || nextSerialId === 0}
              onClick={async () => {
                const hash = await send(t("Certificate issuance"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "issueCertificate",
                    args: [buyer as `0x${string}`],
                  }),
                );
                if (hash) setBuyer("");
              }}
            >
              <Send className="w-4 h-4" />
              {busy ? t("Confirming…") : `${t("Issue")} ${nextSerial}`}
            </GoldButton>
          </div>

          {/* Exact serial — matches a printed physical certificate number. */}
          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4" /> {t("Issue a specific serial")}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {t(
                "Use when the buyer must receive the number printed on their physical certificate.",
              )}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Field
                  label={t("Buyer BSC wallet")}
                  placeholder="0x…"
                  value={exactBuyer}
                  onChange={(e) => setExactBuyer(e.target.value)}
                  disabled={!isMinter}
                />
              </div>
              <Field
                label={t("Serial number")}
                type="number"
                min={1}
                max={cap || undefined}
                placeholder="888"
                value={exactSerial}
                onChange={(e) => setExactSerial(e.target.value)}
                disabled={!isMinter}
              />
            </div>
            <OutlineButton
              className="w-full mt-3"
              disabled={
                !isMinter || busy || !!paused || !isAddress(exactBuyer) || !exactSerialValid
              }
              onClick={async () => {
                const hash = await send(t("Exact serial issuance"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "issueSpecific",
                    args: [exactBuyer as `0x${string}`, BigInt(exactSerial)],
                  }),
                );
                if (hash) {
                  setExactBuyer("");
                  setExactSerial("");
                }
              }}
            >
              {t("Issue")} {exactSerialValid ? fmtSerial(exactSerialNum) : ""}
            </OutlineButton>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="text-sm font-medium mb-2">{t("Batch issue to many buyers")}</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {t("One address per line. Serials are assigned in the order listed.")}
            </p>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              disabled={!isMinter}
              rows={5}
              placeholder={"0x…\n0x…"}
              className="w-full px-3 py-2 rounded-md bg-input border border-border text-xs font-mono disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
              <span>
                {batchAddresses.length} {t("recipients")}
                {invalidBatch.length > 0 && (
                  <span className="text-destructive">
                    {" "}
                    · {invalidBatch.length} {t("invalid")}
                  </span>
                )}
              </span>
              <span>
                {t("max")} {MAX_BATCH_PER_TX}/tx
              </span>
            </div>
            <OutlineButton
              className="w-full mt-3"
              disabled={
                !isMinter ||
                busy ||
                !!paused ||
                batchAddresses.length === 0 ||
                invalidBatch.length > 0 ||
                batchAddresses.length > MAX_BATCH_PER_TX ||
                batchAddresses.length > cap - issued
              }
              onClick={async () => {
                const hash = await send(t("Batch issuance"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "issueCertificates",
                    args: [batchAddresses as `0x${string}`[]],
                  }),
                );
                if (hash) setBatchText("");
              }}
            >
              {t("Issue")} {batchAddresses.length || ""} {t("certificates")}
            </OutlineButton>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <h3 className="text-sm font-medium mb-2">{t("Reserve inventory")}</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {t(
                "Mint a run of consecutive serials to one wallet (e.g. the Safe) to hold as stock.",
              )}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Field
                  label={t("Destination wallet")}
                  placeholder={NFT_WALLETS.safe || "0x…"}
                  value={reserveTo}
                  onChange={(e) => setReserveTo(e.target.value)}
                  disabled={!isMinter}
                />
              </div>
              <Field
                label={t("Quantity")}
                type="number"
                min={1}
                max={MAX_BATCH_PER_TX}
                placeholder="10"
                value={reserveQty}
                onChange={(e) => setReserveQty(e.target.value)}
                disabled={!isMinter}
              />
            </div>
            <OutlineButton
              className="w-full mt-3"
              disabled={
                !isMinter ||
                busy ||
                !!paused ||
                !isAddress(reserveTo) ||
                !(Number(reserveQty) > 0) ||
                Number(reserveQty) > Math.min(MAX_BATCH_PER_TX, cap - issued)
              }
              onClick={async () => {
                const hash = await send(t("Reserve issuance"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "issueCertificateBatch",
                    args: [reserveTo as `0x${string}`, BigInt(reserveQty)],
                  }),
                );
                if (hash) setReserveQty("");
              }}
            >
              {t("Reserve")} {reserveQty || ""} {t("certificates")}
            </OutlineButton>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold mb-4">{t("Highest Serials Issued")}</h2>
          {issued === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center italic">
              {t("No certificates issued yet.")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 font-medium">{t("Serial")}</th>
                    <th className="text-left py-2 font-medium">{t("Round")}</th>
                    <th className="text-right py-2 font-medium">{t("Holder")}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIds.map((id) => (
                    <CertificateRow
                      key={String(id)}
                      tokenId={id}
                      nft={nft}
                      serial={fmtSerial(id)}
                      round={rounds.find((r) => Number(id) >= r.from && Number(id) <= r.to)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>{t("Metadata base URI")}</span>
              <span className="font-mono truncate max-w-[55%]" title={baseUri as string}>
                {(baseUri as string) || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("Metadata")}</span>
              <span>{frozen ? t("frozen (immutable)") : t("editable by Safe")}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("Royalty")}</span>
              <span className="font-mono">
                {royaltyPctCurrent !== undefined ? `${royaltyPctCurrent}%` : "—"} →{" "}
                {short(royaltyTo)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{t("Serial format")}</span>
              <span className="font-mono">{fmtSerial(1)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Safe-only: metadata, royalty, roles, pause ─────────────────── */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">{t("Collection Settings")}</h2>
          <Badge variant="muted">DEFAULT_ADMIN_ROLE</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {isAdmin
            ? t("Signed by the Foundation Safe multisig.")
            : t("Read-only — these actions require the Safe multisig, not the operations wallet.")}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Link2 className="w-4 h-4" /> {t("Metadata")}
            </h3>
            <Field
              label={t("New base URI")}
              placeholder="ipfs://bafy…/"
              value={newBaseUri}
              onChange={(e) => setNewBaseUri(e.target.value)}
              disabled={!isAdmin || !!frozen}
              hint={
                frozen
                  ? t("Metadata is frozen — this can no longer change.")
                  : t("Must end with a slash.")
              }
            />
            <div className="flex gap-2">
              <OutlineButton
                className="flex-1 px-4 py-2"
                disabled={!isAdmin || busy || !!frozen || !newBaseUri.endsWith("/")}
                onClick={async () => {
                  const hash = await send(t("Base URI update"), () =>
                    write({
                      address: nft,
                      abi: certificateNftAbi,
                      functionName: "setBaseURI",
                      args: [newBaseUri],
                    }),
                  );
                  if (hash) setNewBaseUri("");
                }}
              >
                {t("Update URI")}
              </OutlineButton>
              <OutlineButton
                className="px-4 py-2"
                disabled={!isAdmin || busy || !!frozen}
                onClick={() => {
                  if (!confirm(t("Freezing metadata is permanent and cannot be undone. Continue?")))
                    return;
                  send(t("Metadata freeze"), () =>
                    write({
                      address: nft,
                      abi: certificateNftAbi,
                      functionName: "freezeMetadata",
                    }),
                  );
                }}
              >
                <Lock className="w-4 h-4" /> {t("Freeze")}
              </OutlineButton>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" /> {t("Secondary Sale Royalty")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Field
                  label={t("Receiver")}
                  placeholder={NFT_WALLETS.safe || "0x…"}
                  value={royaltyReceiver}
                  onChange={(e) => setRoyaltyReceiver(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <Field
                label={t("Percent")}
                type="number"
                step="0.1"
                min="0"
                max={capPct}
                value={royaltyPct}
                onChange={(e) => setRoyaltyPct(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={
                !isAdmin ||
                busy ||
                !isAddress(royaltyReceiver) ||
                !(Number(royaltyPct) >= 0 && Number(royaltyPct) <= capPct)
              }
              onClick={() =>
                send(t("Royalty update"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "setDefaultRoyalty",
                    args: [
                      royaltyReceiver as `0x${string}`,
                      BigInt(Math.round(Number(royaltyPct) * 100)),
                    ],
                  }),
                )
              }
            >
              {t("Set royalty")} ({royaltyPct || 0}%)
            </OutlineButton>
            <p className="text-[11px] text-muted-foreground">
              {t("Current ceiling")} {capPct}% · {t("adjustable, hard-limited to 25% in code")}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" /> {t("Operations Wallet (MINTER_ROLE)")}
            </h3>
            <Field
              label={t("Wallet address")}
              placeholder={NFT_WALLETS.ops || "0x…"}
              value={roleAddress}
              onChange={(e) => setRoleAddress(e.target.value)}
              disabled={!isAdmin}
              hint={t("Grant to a replacement wallet, or revoke a compromised one.")}
            />
            <div className="flex gap-2">
              <OutlineButton
                className="flex-1 px-4 py-2"
                disabled={!isAdmin || busy || !isAddress(roleAddress)}
                onClick={() =>
                  send(t("Grant MINTER_ROLE"), () =>
                    write({
                      address: nft,
                      abi: certificateNftAbi,
                      functionName: "grantRole",
                      args: [ROLE.minter, roleAddress as `0x${string}`],
                    }),
                  )
                }
              >
                {t("Grant")}
              </OutlineButton>
              <OutlineButton
                className="flex-1 px-4 py-2"
                disabled={!isAdmin || busy || !isAddress(roleAddress)}
                onClick={() =>
                  send(t("Revoke MINTER_ROLE"), () =>
                    write({
                      address: nft,
                      abi: certificateNftAbi,
                      functionName: "revokeRole",
                      args: [ROLE.minter, roleAddress as `0x${string}`],
                    }),
                  )
                }
              >
                {t("Revoke")}
              </OutlineButton>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              {paused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}{" "}
              {t("Emergency Pause")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t(
                "Pausing halts all issuance AND all holder transfers. Use only for a live security incident.",
              )}
            </p>
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={!isAdmin || busy}
              onClick={() => {
                if (!confirm(t("Confirm pause state change for the whole collection?"))) return;
                send(paused ? t("Unpause") : t("Pause"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: paused ? "unpause" : "pause",
                  }),
                );
              }}
            >
              {paused ? t("Unpause collection") : t("Pause collection")}
            </OutlineButton>
          </div>
        </div>
      </Card>

      {/* ── Safe-only: business parameters ─────────────────────────────── */}
      <Card className="mt-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold">{t("Collection Parameters")}</h2>
          <Badge variant="muted">DEFAULT_ADMIN_ROLE</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {t(
            "Every value below is stored on-chain and can be changed at any time without redeploying.",
          )}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" /> {t("Name & Symbol")}
            </h3>
            <Field
              label={t("Collection name")}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={!isAdmin}
            />
            <Field
              label={t("Symbol")}
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              disabled={!isAdmin}
            />
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={!isAdmin || busy || !newName.trim() || !newSymbol.trim()}
              onClick={() =>
                send(t("Rename collection"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "setNameAndSymbol",
                    args: [newName.trim(), newSymbol.trim()],
                  }),
                )
              }
            >
              {t("Save name & symbol")}
            </OutlineButton>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Hash className="w-4 h-4" /> {t("Serial Number Format")}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Field
                  label={t("Prefix")}
                  value={newPrefix}
                  onChange={(e) => setNewPrefix(e.target.value)}
                  disabled={!isAdmin}
                />
              </div>
              <Field
                label={t("Digits")}
                type="number"
                min={1}
                max={32}
                value={newPadding}
                onChange={(e) => setNewPadding(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {t("Preview")}: {newPrefix}
              {String(1).padStart(Number(newPadding) || 1, "0")}
            </p>
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={!isAdmin || busy || !(Number(newPadding) >= 1 && Number(newPadding) <= 32)}
              onClick={() =>
                send(t("Serial format update"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "setSerialFormat",
                    args: [newPrefix, Number(newPadding)],
                  }),
                )
              }
            >
              {t("Save serial format")}
            </OutlineButton>
            <p className="text-[11px] text-muted-foreground">
              {t("Affects on-chain display only — regenerate the metadata to match.")}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> {t("Supply Cap")}
            </h3>
            <Field
              label={t("New maximum supply")}
              type="number"
              min={1}
              max={cap ? cap - 1 : undefined}
              placeholder={String(cap)}
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
              disabled={!isAdmin}
              hint={`${t("Current")} ${cap.toLocaleString()} · ${t("can only be lowered, never raised")}`}
            />
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={!isAdmin || busy || !(Number(newCap) > 0 && Number(newCap) < cap)}
              onClick={() => {
                if (
                  !confirm(
                    t(
                      "Lowering the supply cap is permanent — it can never be raised again. Continue?",
                    ),
                  )
                )
                  return;
                send(t("Supply cap reduction"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "reduceMaxSupply",
                    args: [BigInt(newCap)],
                  }),
                );
              }}
            >
              {t("Lower cap to")} {newCap || "—"}
            </OutlineButton>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Percent className="w-4 h-4" /> {t("Royalty Ceiling")}
            </h3>
            <Field
              label={t("Maximum royalty percent")}
              type="number"
              step="0.1"
              min="0"
              max="25"
              value={newRoyaltyCap}
              onChange={(e) => setNewRoyaltyCap(e.target.value)}
              disabled={!isAdmin}
              hint={t("The ceiling the royalty setter is checked against.")}
            />
            <OutlineButton
              className="w-full px-4 py-2"
              disabled={
                !isAdmin || busy || !(Number(newRoyaltyCap) >= 0 && Number(newRoyaltyCap) <= 25)
              }
              onClick={() =>
                send(t("Royalty ceiling update"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "setMaxRoyaltyBps",
                    args: [BigInt(Math.round(Number(newRoyaltyCap) * 100))],
                  }),
                )
              }
            >
              {t("Set ceiling to")} {newRoyaltyCap || 0}%
            </OutlineButton>
          </div>
        </div>

        {/* Rounds editor */}
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-sm font-medium flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4" /> {t("Issuance Rounds & BDL Allocation")}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {t(
              "Serial ranges must ascend and must not overlap. Gaps are allowed — a serial no round covers simply has no allocation.",
            )}
          </p>

          <div className="space-y-2">
            {roundDraft.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-1 text-xs text-muted-foreground pb-2.5">R{i + 1}</div>
                <div className="col-span-3">
                  <Field
                    label={i === 0 ? t("From serial") : ""}
                    type="number"
                    value={r.from}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const next = [...roundDraft];
                      next[i] = { ...next[i], from: e.target.value };
                      setRoundDraft(next);
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <Field
                    label={i === 0 ? t("To serial") : ""}
                    type="number"
                    value={r.to}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const next = [...roundDraft];
                      next[i] = { ...next[i], to: e.target.value };
                      setRoundDraft(next);
                    }}
                  />
                </div>
                <div className="col-span-4">
                  <Field
                    label={i === 0 ? `${BRAND.symbol} ${t("per certificate")}` : ""}
                    type="number"
                    value={r.bdl}
                    disabled={!isAdmin}
                    onChange={(e) => {
                      const next = [...roundDraft];
                      next[i] = { ...next[i], bdl: e.target.value };
                      setRoundDraft(next);
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <button
                    disabled={!isAdmin}
                    onClick={() => setRoundDraft(roundDraft.filter((_, j) => j !== i))}
                    className="p-2 rounded-md hover:bg-secondary transition-colors disabled:opacity-40"
                    title={t("Remove round")}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <OutlineButton
              className="px-4 py-2"
              disabled={!isAdmin}
              onClick={() => setRoundDraft([...roundDraft, { from: "", to: "", bdl: "" }])}
            >
              <Plus className="w-4 h-4" /> {t("Add round")}
            </OutlineButton>
            <OutlineButton
              className="px-4 py-2"
              disabled={!isAdmin}
              onClick={() =>
                setRoundDraft(
                  rounds.map((r) => ({
                    from: String(r.from),
                    to: String(r.to),
                    bdl: String(r.bdlAirdrop),
                  })),
                )
              }
            >
              {t("Reset")}
            </OutlineButton>
            <GoldButton
              className="px-6 py-2 ml-auto"
              disabled={
                !isAdmin ||
                busy ||
                roundDraft.length === 0 ||
                roundDraft.some(
                  (r) =>
                    !(Number(r.from) >= 1) ||
                    !(Number(r.to) >= Number(r.from)) ||
                    Number(r.to) > cap ||
                    !(Number(r.bdl) >= 0),
                )
              }
              onClick={() =>
                send(t("Rounds update"), () =>
                  write({
                    address: nft,
                    abi: certificateNftAbi,
                    functionName: "setRounds",
                    args: [
                      roundDraft.map((r) => ({
                        from: Number(r.from),
                        to: Number(r.to),
                        bdlAirdrop: BigInt(r.bdl || 0),
                      })),
                    ],
                  }),
                )
              }
            >
              {t("Save rounds")}
            </GoldButton>
          </div>
        </div>
      </Card>

      <p className="mt-6 text-xs text-muted-foreground">
        {t(
          "Everything above is editable on-chain by the Safe. The only one-way rules: the supply cap can be lowered but never raised, and a serial is issued at most once — burning does not release it.",
        )}
      </p>
    </Section>
  );
}
