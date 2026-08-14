/**
 * Creator DAO Certificate (BEP-721) — on-chain config for the dApp.
 *
 * Mirrors contracts/BlockLabelCertificateNFT.sol. Addresses come from env and
 * are filled in after `npm run nft:deploy:*`. The round table below is the same
 * one baked into the contract's `roundOf()` and into the generated metadata —
 * keep the three in sync if the client ever revises the issuance plan.
 */
import { parseAbi } from "viem";

const env = import.meta.env;
const asAddr = (v: string | undefined) =>
  v && /^0x[a-fA-F0-9]{40}$/.test(v) ? (v as `0x${string}`) : undefined;

/** Deployed certificate collection. `undefined` until the contract is live. */
export const CERTIFICATE_NFT = asAddr(env.VITE_CERTIFICATE_NFT_ADDRESS);

/** Wallets the client operates — shown in the ops console for orientation. */
export const NFT_WALLETS = {
  /** Foundation Safe multisig: owner, admin, pauser, royalty receiver. */
  safe: asAddr(env.VITE_NFT_SAFE_WALLET),
  /** Hot operations wallet: MINTER_ROLE only. */
  ops: asAddr(env.VITE_NFT_OPS_WALLET),
} as const;

/** Gateway used to render IPFS metadata + artwork in the browser. */
export const IPFS_GATEWAY = env.VITE_IPFS_GATEWAY || "https://ipfs.io/ipfs/";

/** Default supply cap. The live value is `maxSupply()` — lowerable on-chain. */
export const MAX_CERTIFICATES = 10_000;
export const CERT_SERIAL_PREFIX = "BLDAO-";

/**
 * Issuance rounds — NFT Certificate Issuance Plan §13.1.
 *
 * These are the DEFAULTS the contract is seeded with. They are editable on-chain
 * by the Safe, so anything user-facing should prefer `getRounds()` from the
 * contract and fall back to this table only before the contract is deployed.
 */
export const CERT_ROUNDS = [
  { round: 1, from: 1, to: 1_000, bdlAirdrop: 200_000 },
  { round: 2, from: 1_001, to: 4_000, bdlAirdrop: 150_000 },
  { round: 3, from: 4_001, to: 7_000, bdlAirdrop: 120_000 },
  { round: 4, from: 7_001, to: 10_000, bdlAirdrop: 100_000 },
] as const;

export type CertRound = (typeof CERT_ROUNDS)[number];

/** Round descriptor for a serial number, or undefined if out of range. */
export function roundOf(tokenId: number): CertRound | undefined {
  return CERT_ROUNDS.find((r) => tokenId >= r.from && tokenId <= r.to);
}

/** 7 -> "BLDAO-000007" */
export function serialOf(tokenId: number | bigint): string {
  return `${CERT_SERIAL_PREFIX}${String(tokenId).padStart(6, "0")}`;
}

/** `ipfs://cid/1.json` -> `https://<gateway>/cid/1.json` */
export function ipfsToHttp(uri: string | undefined): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) return `${IPFS_GATEWAY}${uri.slice(7)}`;
  return uri;
}

/** Role ids — keccak256 of the role name, as in AccessControl. */
export const ROLE = {
  admin: "0x0000000000000000000000000000000000000000000000000000000000000000",
  /** keccak256("MINTER_ROLE") */
  minter: "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6",
  /** keccak256("PAUSER_ROLE") */
  pauser: "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a",
} as const;

/**
 * Batch ceiling per transaction. One issuance costs ~118k gas (ERC721Enumerable
 * bookkeeping included), so 100 lands at ~11.8M gas — comfortably inside BSC's
 * block limit with room for gas-price swings.
 */
export const MAX_BATCH_PER_TX = 100;

export const certificateNftAbi = parseAbi([
  // ── reads ──
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function totalIssued() view returns (uint256)",
  "function remainingSupply() view returns (uint256)",
  "function nextTokenId() view returns (uint256)",
  "function maxSupply() view returns (uint256)",
  "function highestIssuedSerial() view returns (uint256)",
  "function serialIssued(uint256 tokenId) view returns (bool)",
  "function serialOf(uint256 tokenId) view returns (string)",
  "function serialPrefix() view returns (string)",
  "function serialPadding() view returns (uint8)",
  "function maxRoyaltyBps() view returns (uint96)",
  "function ABSOLUTE_MAX_ROYALTY_BPS() view returns (uint96)",
  "function roundCount() view returns (uint256)",
  "function bdlAirdropOf(uint256 tokenId) view returns (uint256)",
  "function getRounds() view returns ((uint32 from, uint32 to, uint96 bdlAirdrop)[])",
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function baseURI() view returns (string)",
  "function contractURI() view returns (string)",
  "function certificatesOf(address owner) view returns (uint256[])",
  "function exists(uint256 tokenId) view returns (bool)",
  "function roundOf(uint256 tokenId) view returns (uint256)",
  "function paused() view returns (bool)",
  "function metadataFrozen() view returns (bool)",
  "function owner() view returns (address)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)",
  // ── writes: operations wallet (MINTER_ROLE) ──
  "function issueCertificate(address to) returns (uint256)",
  "function issueCertificates(address[] recipients) returns (uint256, uint256)",
  "function issueCertificateBatch(address to, uint256 quantity) returns (uint256, uint256)",
  "function issueSpecific(address to, uint256 tokenId)",
  "function issueSpecificBatch(address[] recipients, uint256[] tokenIds)",
  // ── writes: Safe (DEFAULT_ADMIN_ROLE / PAUSER_ROLE) ──
  "function setBaseURI(string newBaseURI)",
  "function setContractURI(string newContractURI)",
  "function freezeMetadata()",
  "function setDefaultRoyalty(address receiver, uint96 feeNumerator)",
  "function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)",
  "function setMaxRoyaltyBps(uint96 newMaxRoyaltyBps)",
  "function setNameAndSymbol(string newName, string newSymbol)",
  "function setSerialFormat(string prefix, uint8 padding)",
  "function setRounds((uint32 from, uint32 to, uint96 bdlAirdrop)[] newRounds)",
  "function reduceMaxSupply(uint256 newMaxSupply)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  "function pause()",
  "function unpause()",
  // ── events ──
  "event CertificateIssued(uint256 indexed tokenId, address indexed to, uint256 indexed round)",
]);

/** A round as stored on-chain by {getRounds}. */
export interface OnChainRound {
  from: number;
  to: number;
  bdlAirdrop: bigint;
}

/** Normalises `getRounds()` output, falling back to the static defaults. */
export function resolveRounds(onChain: readonly OnChainRound[] | undefined) {
  if (!onChain || onChain.length === 0) {
    return CERT_ROUNDS.map((r) => ({ round: r.round, from: r.from, to: r.to, bdlAirdrop: r.bdlAirdrop }));
  }
  return onChain.map((r, i) => ({
    round: i + 1,
    from: Number(r.from),
    to: Number(r.to),
    bdlAirdrop: Number(r.bdlAirdrop),
  }));
}

export type ResolvedRound = ReturnType<typeof resolveRounds>[number];

/** Round descriptor for a serial from an already-resolved round table. */
export function roundOfResolved(tokenId: number, rounds: ResolvedRound[]) {
  return rounds.find((r) => tokenId >= r.from && tokenId <= r.to);
}

/** Metadata shape produced by contracts/scripts/generate_nft_metadata.js. */
export interface CertificateMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: { trait_type: string; value: string | number }[];
  properties?: {
    serialNumber?: string;
    tokenId?: number;
    round?: number;
    bdlAirdrop?: string;
  };
}

/** Fetches + normalises one certificate's IPFS metadata. */
export async function fetchCertificateMetadata(
  tokenUri: string,
): Promise<CertificateMetadata | undefined> {
  const url = ipfsToHttp(tokenUri);
  if (!url) return undefined;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metadata ${res.status}`);
  return (await res.json()) as CertificateMetadata;
}

/** BscScan base URL for the configured network. */
export const EXPLORER =
  env.VITE_BSC_CHAIN_ID === "56" ? "https://bscscan.com" : "https://testnet.bscscan.com";
