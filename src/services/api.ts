/**
 * Frontend API service — typed functions for every backend endpoint.
 * JWT is stored in memory only (authStore) and attached to authenticated calls.
 */

import { useAuthStore } from "@/store/authStore";

const BASE_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:4000";

// ─── Internal helpers ───

function getJwt(): string | null {
  return useAuthStore.getState().jwt;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const jwt = getJwt();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    // Only clear JWT if the store has fully loaded from localStorage.
    // If it hasn't hydrated yet, the 401 was caused by a missing header
    // (not a truly expired token), so don't wipe the stored session.
    const store = useAuthStore.getState();
    if (store._hasHydrated) {
      store.clearJwt();
    }
    throw new Error("Session expired. Please reconnect your wallet.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

// ─── Auth ───

export async function fetchNonce(address: string): Promise<{ nonce: string }> {
  return request(`/api/auth/nonce?address=${address}`);
}

export async function verifySignature(
  address: string,
  signature: string,
): Promise<{ token: string }> {
  return request("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ address, signature }),
  });
}

// ─── User Profile ───

export interface UserProfile {
  id: string;
  address: string;
  display_name: string | null;
  language: string;
  notif_airdrop: boolean;
  notif_staking: boolean;
  notif_price: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProfile(): Promise<UserProfile> {
  return request("/api/user/profile");
}

export async function updateProfile(
  updates: Partial<
    Pick<
      UserProfile,
      | "display_name"
      | "language"
      | "notif_airdrop"
      | "notif_staking"
      | "notif_price"
    >
  >,
): Promise<UserProfile> {
  return request("/api/user/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ─── Token ───

export interface TokenBalance {
  address: string;
  balance: string;
  symbol: string;
}

export async function getTokenBalance(address: string): Promise<TokenBalance> {
  return request(`/api/token/balance/${address}`);
}

export interface TokenStats {
  totalSupply: string;
  symbol: string;
  chain: string;
  contractAddress: string;
}

export async function getTokenStats(): Promise<TokenStats> {
  return request("/api/token/stats");
}

// ─── Transactions ───

export interface Transaction {
  id: string;
  tx_hash: string;
  type: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_symbol: string;
  timestamp: string;
  network: string;
  status: string;
}

export async function getTransactions(address: string): Promise<Transaction[]> {
  return request(`/api/transactions/${address}`);
}

export async function recordTransaction(tx: {
  tx_hash: string;
  type: string;
  from_address?: string;
  to_address?: string;
  amount: string;
  status?: string;
}): Promise<Transaction> {
  return request("/api/transactions/record", {
    method: "POST",
    body: JSON.stringify(tx),
  });
}

// ─── Airdrop ───

export interface AirdropStatus {
  eligible: boolean;
  webKeyBalance: string;
  webKeyBalanceFormatted: string;
  threshold: string;
  thresholdFormatted: string;
  rewardAmount: number;
  /** Source of eligibility: "BDLStaking" (540-day lock) or legacy Block Label credit. */
  source?: string;
  /** Raw BDL staked (when using the staking contract). */
  stakedWkeyDao2?: string;
  /** Global stake order (drives airdrop round / early-bird tier). */
  stakeSequence?: number;
  /** Unix seconds when the 540-day lock ends. */
  unlockTime?: number;
  /** Seconds remaining on the 540-day lock. */
  remainingLockSeconds?: string;
}

export async function getAirdropStatus(
  address: string,
): Promise<AirdropStatus> {
  return request(`/api/airdrop/status/${address}`);
}

// ─── Airdrop Merkle claim (BDLAirdropDistributor) ───

export interface AirdropProof {
  round: number;
  index: number;
  account: string;
  amount: string; // wei
  proof: `0x${string}`[];
}

/** Fetch a wallet's Merkle claim for a round (404 if not included). */
export async function getAirdropProof(
  round: number,
  address: string,
): Promise<AirdropProof> {
  return request(`/api/airdrop/proof/${round}/${address}`);
}

export interface AirdropRoundMeta {
  round: number;
  root: string;
  count: number;
}

export async function getAirdropRound(round: number): Promise<AirdropRoundMeta> {
  return request(`/api/airdrop/round/${round}`);
}

/** Admin: build a round's Merkle tree; returns the root to set on-chain. */
export async function adminBuildRound(
  round: number,
  claims: { address: string; amount: string | number }[],
): Promise<AirdropRoundMeta> {
  return request("/api/admin/airdrop/build-round", {
    method: "POST",
    body: JSON.stringify({ round, claims }),
  });
}

// ─── Referrals ───

export interface Referral {
  id: string;
  referrer_address: string;
  referred_address: string;
  join_date: string;
  reward_amount: number;
  status: string;
}

export interface ReferralData {
  referrals: Referral[];
  stats: {
    totalReferrals: number;
    totalRewards: number;
    pendingRewards: number;
    stakedBlockLabel?: string;
  };
}

export async function getReferrals(address: string): Promise<ReferralData> {
  return request(`/api/referral/${address}`);
}


// ─── DAO ───

export interface DaoAccount {
  address: string;
  role: string;
  tokens_held: number;
  votes_cast: number;
  rewards_earned: number;
}

export interface DaoProposal {
  id: string;
  proposal_id: string;
  title: string;
  status: string;
  voted_at: string;
}

export interface DaoParticipation {
  id: string;
  type: string;
  description: string;
  date: string;
  reward: number;
}

export interface DaoData {
  account: DaoAccount;
  proposals: DaoProposal[];
  participation: DaoParticipation[];
}

export async function getDaoAccount(address: string): Promise<DaoData> {
  return request(`/api/dao/account/${address}`);
}

export async function updateDaoAccount(
  address: string,
  updates: Partial<DaoAccount>,
): Promise<DaoAccount> {
  return request(`/api/dao/account/${address}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ─── Admin ───

export async function adminAirdrop(
  to: string,
  amount: string,
): Promise<{ txHash: string }> {
  return request("/api/admin/airdrop", {
    method: "POST",
    body: JSON.stringify({ to, amount }),
  });
}

export interface AdminLog {
  id: string;
  action: string;
  performed_by: string;
  target_address: string;
  amount: string;
  tx_hash: string;
  timestamp: string;
}

export interface UserEligibility {
  address: string;
  name: string | null;
  webKeyBalance: number;
  eligible: boolean;
  rewardAmount: number;
}

export async function getEligibilityList(): Promise<UserEligibility[]> {
  return request("/api/admin/users-eligibility");
}

export async function adminBulkAirdrop(
  recipients: { address: string; amount: number }[],
): Promise<{ results: any[] }> {
  return request("/api/admin/bulk-airdrop", {
    method: "POST",
    body: JSON.stringify({ recipients }),
  });
}

export async function getAdminLogs(): Promise<AdminLog[]> {
  return request("/api/admin/logs");
}

export async function getContractStatus(): Promise<{ paused: boolean }> {
  return request("/api/admin/contract-status");
}

export async function togglePause(pause: boolean): Promise<{ success: boolean; txHash: string }> {
  return request("/api/admin/toggle-pause", {
    method: "POST",
    body: JSON.stringify({ pause }),
  });
}
