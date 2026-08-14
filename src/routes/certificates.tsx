import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Award, ExternalLink, ShieldCheck, Lock, Image as ImageIcon } from "lucide-react";
import { Section, Card, Badge, OutlineButton } from "@/components/ui-bits";
import { WalletGuard } from "@/components/WalletGuard";
import { useI18n } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import {
  CERTIFICATE_NFT,
  certificateNftAbi,
  EXPLORER,
  ipfsToHttp,
  fetchCertificateMetadata,
  resolveRounds,
  roundOfResolved,
  type CertificateMetadata,
  type OnChainRound,
  type ResolvedRound,
} from "@/lib/nft";

export const Route = createFileRoute("/certificates")({
  head: () => ({ meta: [{ title: `My Certificates — ${BRAND.name}` }] }),
  component: () => (
    <WalletGuard>
      <Certificates />
    </WalletGuard>
  ),
});

/** One certificate card — artwork + serial + round, metadata loaded from IPFS. */
function CertificateCard({
  tokenId,
  serial,
  round,
}: {
  tokenId: bigint;
  serial: string;
  round?: ResolvedRound;
}) {
  const { t } = useI18n();
  const [meta, setMeta] = useState<CertificateMetadata>();
  const [failed, setFailed] = useState(false);

  const { data: tokenUri } = useReadContract({
    address: CERTIFICATE_NFT,
    abi: certificateNftAbi,
    functionName: "tokenURI",
    args: [tokenId],
    query: { enabled: !!CERTIFICATE_NFT },
  });

  useEffect(() => {
    if (!tokenUri) return;
    let alive = true;
    fetchCertificateMetadata(tokenUri as string)
      .then((m) => alive && setMeta(m))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [tokenUri]);

  const image = ipfsToHttp(meta?.image);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="aspect-square bg-secondary flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={serial}
            className="w-full h-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="text-center text-muted-foreground p-6">
            <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <div className="text-xs">{failed ? t("Artwork unavailable") : t("Loading artwork…")}</div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold">{serial}</span>
          <Badge variant="muted">Round {round?.round ?? "—"}</Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between text-xs">
          <span className="text-muted-foreground">{t("Allocated airdrop")}</span>
          <span className="font-display font-semibold text-base">
            {(round?.bdlAirdrop ?? 0).toLocaleString()} {BRAND.symbol}
          </span>
        </div>
        <a
          href={`${EXPLORER}/token/${CERTIFICATE_NFT}?a=${tokenId}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline"
        >
          {t("View on BscScan")} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}

function Certificates() {
  const { t } = useI18n();
  const { address } = useAccount();
  const nft = CERTIFICATE_NFT;
  const base = { address: nft, abi: certificateNftAbi } as const;
  const enabled = !!nft;

  const { data: owned } = useReadContract({
    ...base,
    functionName: "certificatesOf",
    args: [address as `0x${string}`],
    query: { enabled: enabled && !!address },
  });
  const { data: totalIssued } = useReadContract({ ...base, functionName: "totalIssued", query: { enabled } });
  const { data: maxSupply } = useReadContract({ ...base, functionName: "maxSupply", query: { enabled } });
  const { data: chainRounds } = useReadContract({ ...base, functionName: "getRounds", query: { enabled } });
  const { data: prefix } = useReadContract({ ...base, functionName: "serialPrefix", query: { enabled } });
  const { data: padding } = useReadContract({ ...base, functionName: "serialPadding", query: { enabled } });

  const tokenIds = (owned as bigint[] | undefined) ?? [];
  const rounds = resolveRounds(chainRounds as readonly OnChainRound[] | undefined);
  const cap = Number(maxSupply ?? 10_000n);

  /** Serial rendered with the collection's current on-chain format. */
  const fmtSerial = (id: number | bigint) =>
    `${(prefix as string) ?? "BLDAO-"}${String(id).padStart(Number(padding ?? 6), "0")}`;

  if (!nft) {
    return (
      <Section className="py-20">
        <Card className="max-w-lg mx-auto text-center">
          <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t("Certificates are not live yet")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("The Creator DAO Certificate collection has not been deployed to this network yet.")}
          </p>
        </Card>
      </Section>
    );
  }

  const holds = tokenIds.length > 0;
  const totalBdl = tokenIds.reduce(
    (sum, id) => sum + (roundOfResolved(Number(id), rounds)?.bdlAirdrop ?? 0),
    0,
  );

  return (
    <Section className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          {t("Creator DAO Certificates")}
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {t(
            "Your Block Label Creator DAO Certificates. Each certificate carries a unique serial number, an allocated {{SYMBOL}} airdrop, and access to the IP wholesale market.",
          )}
        </p>
      </div>

      {/* Token-gating status — Issuance Plan §12.4 */}
      <Card className={holds ? "border-gold/40" : ""}>
        <div className="flex items-start gap-4">
          {holds ? (
            <ShieldCheck className="w-8 h-8 text-gold shrink-0" />
          ) : (
            <Lock className="w-8 h-8 text-muted-foreground shrink-0" />
          )}
          <div className="flex-1">
            <h2 className="font-semibold">
              {holds ? t("Wholesale access granted") : t("Certificate required")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {holds
                ? t(
                    "Ownership verified on-chain. You can browse and purchase IP wholesale products.",
                  )
                : t(
                    "This wallet holds no Creator DAO Certificate. Certificates are issued by the Foundation once your order is confirmed.",
                  )}
            </p>
          </div>
          {holds && (
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground">{t("Membership tier")}</div>
              <div className="font-display text-lg font-semibold">
                {tokenIds.length >= 5 ? "Gold" : tokenIds.length >= 3 ? "Silver" : "Bronze"}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-lg bg-secondary">
          <div className="text-xs text-muted-foreground">{t("Your certificates")}</div>
          <div className="font-display text-2xl font-semibold mt-1">{tokenIds.length}</div>
        </div>
        <div className="p-4 rounded-lg bg-secondary">
          <div className="text-xs text-muted-foreground">{t("Allocated airdrop")}</div>
          <div className="font-display text-2xl font-semibold mt-1">
            {totalBdl.toLocaleString()} {BRAND.symbol}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-secondary">
          <div className="text-xs text-muted-foreground">{t("Issued collection-wide")}</div>
          <div className="font-display text-2xl font-semibold mt-1">
            {Number(totalIssued ?? 0n).toLocaleString()}
            <span className="text-sm text-muted-foreground font-sans">
              {" "}
              / {cap.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {holds ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {tokenIds.map((id) => (
            <CertificateCard
              key={String(id)}
              tokenId={id}
              serial={fmtSerial(id)}
              round={roundOfResolved(Number(id), rounds)}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <h2 className="font-semibold mb-3">{t("How to obtain a certificate")}</h2>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>{t("Submit a purchase application to the Block Label Foundation.")}</li>
            <li>{t("Complete payment by card or PG; the team confirms the order.")}</li>
            <li>
              {t(
                "The Foundation issues the next certificate serial directly to your BSC wallet — no action needed from you.",
              )}
            </li>
            <li>{t("Your certificate then appears on this page automatically.")}</li>
          </ol>
          <div className="mt-5">
            <OutlineButton
              className="px-4 py-2"
              onClick={() => window.open("https://blocklabel.io", "_blank")}
            >
              {t("Purchase information")} <ExternalLink className="w-4 h-4" />
            </OutlineButton>
          </div>
        </Card>
      )}

      <Card className="mt-8">
        <h2 className="font-semibold mb-4">{t("Airdrop allocation by round")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border">
              <tr>
                <th className="text-left py-2 font-medium">{t("Round")}</th>
                <th className="text-left py-2 font-medium">{t("Serial range")}</th>
                <th className="text-right py-2 font-medium">{t("Units")}</th>
                <th className="text-right py-2 font-medium">
                  {BRAND.symbol} {t("per certificate")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((r) => (
                <tr key={r.round} className="border-b border-border/50 last:border-0">
                  <td className="py-3">Round {r.round}</td>
                  <td className="py-3 font-mono text-xs">
                    {fmtSerial(r.from)} … {fmtSerial(r.to)}
                  </td>
                  <td className="py-3 text-right">{(r.to - r.from + 1).toLocaleString()}</td>
                  <td className="py-3 text-right font-medium">{r.bdlAirdrop.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Section>
  );
}
