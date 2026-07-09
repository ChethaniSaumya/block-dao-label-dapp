import { ethers } from "ethers";

/**
 * Frontend blockchain service — reads directly from BSC contracts.
 * For write operations, users sign transactions via their wallet (wagmi).
 */

const BDL_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
const WEBKEY_ADDRESS = import.meta.env.VITE_WEBKEY_CONTRACT_ADDRESS;

const BSC_RPC =
  import.meta.env.VITE_BSC_MAINNET_RPC || "https://bsc-dataseed.binance.org";

const provider = new ethers.JsonRpcProvider(BSC_RPC);

// Minimal ABIs for read-only operations
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

/**
 * Returns the project token balance formatted as a human-readable string.
 */
export async function getTokenBalance(address: string): Promise<string> {
  if (!BDL_ADDRESS || BDL_ADDRESS === "PENDING_DEPLOYMENT")
    return "0";
  try {
    const contract = new ethers.Contract(BDL_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch {
    return "0";
  }
}

/**
 * Returns the project token's total supply formatted as a human-readable string.
 */
export async function getTotalSupply(): Promise<string> {
  if (!BDL_ADDRESS || BDL_ADDRESS === "PENDING_DEPLOYMENT")
    return "0";
  try {
    const contract = new ethers.Contract(BDL_ADDRESS, ERC20_ABI, provider);
    const supply = await contract.totalSupply();
    return ethers.formatEther(supply);
  } catch {
    return "0";
  }
}

/**
 * Returns Block Label token balance for an address (raw wei string).
 * Used to check Link2E airdrop eligibility threshold.
 */
export async function checkBlockLabelBalance(address: string): Promise<string> {
  if (!WEBKEY_ADDRESS) return "0";
  try {
    const contract = new ethers.Contract(WEBKEY_ADDRESS, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch {
    return "0";
  }
}
