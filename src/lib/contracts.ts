/**
 * Central on-chain contract config for the BDL Phase-1 dApp.
 * Addresses come from env (filled after `deploy_blocklabel.js`); ABIs are the
 * minimal human-readable slices the UI needs. Used with wagmi's
 * useReadContract / useWriteContract (viem parses the human-readable ABI).
 */
import { parseAbi } from "viem";

const env = import.meta.env;
const asAddr = (v: string | undefined) =>
  v && /^0x[a-fA-F0-9]{40}$/.test(v) ? (v as `0x${string}`) : undefined;

export const ADDR = {
  token: asAddr(env.VITE_TOKEN_CONTRACT_ADDRESS),
  distributor: asAddr(env.VITE_DISTRIBUTOR_ADDRESS),
  teamLockup: asAddr(env.VITE_TEAMLOCKUP_ADDRESS),
  bdlToken: asAddr(env.VITE_BDL_ADDRESS || env.VITE_WKEYDAO2_ADDRESS),
} as const;

export const erc20Abi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);



export const distributorAbi = parseAbi([
  "function claim(uint256 round, uint256 index, address account, uint256 amount, bytes32[] proof)",
  "function isClaimed(uint256 round, uint256 index) view returns (bool)",
]);

export const teamLockupAbi = parseAbi([
  "function cumulativeVerifiedBurned() view returns (uint256)",
  "function teamAllocationBurned() view returns (uint256)",
  "function teamAllocation() view returns (uint256)",
  "function totalSupplyBase() view returns (uint256)",
  "function burnMilestone() view returns (uint256)",
  "function burnProgressBps() view returns (uint256)",
  "function milestoneReached() view returns (bool)",
  "function bonusPoolUnlocked() view returns (bool)",
  "function remainingLockedTeam() view returns (uint256)",
]);

/** Demo-only: MockWkeyDAO2 has a public mint so the client can self-serve test tokens. */
export const demoMintAbi = parseAbi(["function mint(address to, uint256 amount)"]);
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

/** BDL uses 18 decimals */
export const BDL_DECIMALS = 18;
