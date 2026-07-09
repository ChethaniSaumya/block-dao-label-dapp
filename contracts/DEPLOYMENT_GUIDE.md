# Block Label (BDL) - Deployment Guide & Settings

This document provides the specific details required for the CertiK audit and subsequent Mainnet deployment. The deployment script enforces strict on-chain distribution rules directly per Whitepaper §5.

## 1. Token Contract Files
The final CertiK submission scope consists of exactly three contracts in the `contracts/contracts/` directory:
*   **`BlockLabelToken.sol`**: The BEP-20 BDL token contract. Fixed supply of 10,000,000,000. No minting function.
*   **`BDLAirdropDistributor.sol`**: The Airdrop Distribution contract. This manages the safe release of tokens to verified users via Merkle proofs.
*   **`TeamLockup.sol`**: The vault that locks the 10% team allocation until the 50% token burn milestone is reached.

## 2. Wallet / Address Settings (allocations.json)
Before deploying to Mainnet, you must populate the `allocations.json` file in the root of the `contracts` directory. 

The deployment script (`deploy_blocklabel.js`) requires these 6 wallets to be configured. The script will automatically iterate through this JSON file and distribute 9B BDL directly to these wallets at deployment:
*   **Fan DAO Community:** (2.5B BDL)
*   **Creator DAO:** (2.5B BDL)
*   **Marketing:** (1.5B BDL)
*   **Governance:** (1.0B BDL)
*   **Ecosystem Fund:** (1.0B BDL)
*   **Early Participants:** (0.5B BDL)

*Note: The remaining 10% (1B BDL Team Allocation) is automatically transferred to the `TeamLockup` contract. The script enforces a hard invariant that `distributed + team lockup == total supply`. If the Deployer wallet retains a balance > 0, the script intentionally fails and reverts the deployment.*

## 3. Distribution-Related Settings (Airdrop Workflow)
The Airdrop system supports manual verification of cash/crypto buyers and NFT deliveries off-chain.

**The Workflow:**
1. Your team manually verifies purchasers and delivers the NFT.
2. You compile a list of verified wallet addresses and their specific airdrop amounts.
3. This list is converted into a secure snapshot (Merkle Tree).
4. Your Admin Wallet uploads this snapshot to the `BDLAirdropDistributor.sol` contract.
5. The verified users connect to the DApp and claim their exact allocation. 

*Unverified users cannot claim tokens, ensuring total control over the distribution.*

## 4. Basic DApp Website Structure
The frontend source code (located in the `src/` directory) is fully branded for Block Label. It includes:
*   **Dashboard (`/dashboard`)**: Displays user balances and claimable airdrops.
*   **Airdrop Page (`/airdrop`)**: The interface where manually verified users will claim their tokens.
*   **Contracts Config (`lib/contracts.ts`)**: The file where the final Mainnet contract addresses will be injected.

## 5. Post-Deployment Ownership Transfer
Following a successful deployment, the Deployer EOA (Externally Owned Account) must transfer all administrative controls to the 3-of-5 Multisig to mitigate centralization risks prior to the CertiK audit finalization.

You must call the following functions to transfer control to the Multisig:
*   `transferOwnership(multisigAddress)` on `BlockLabelToken`
*   `grantRole(PAUSER_ROLE, multisigAddress)` on `BlockLabelToken`
*   `grantRole(DEFAULT_ADMIN_ROLE, multisigAddress)` on `BlockLabelToken`
*   `transferOwnership(multisigAddress)` on `BDLAirdropDistributor`

Once the roles are confirmed on the Multisig, the Deployer must renounce their roles.
