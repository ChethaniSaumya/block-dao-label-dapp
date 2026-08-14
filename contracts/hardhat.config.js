require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Shared optimizer settings — identical across compiler versions so the audit
// artifacts stay comparable.
const settings = { optimizer: { enabled: true, runs: 200 } };

// OpenZeppelin v5.6 ERC-721 requires ^0.8.24, while the already-scoped BEP-20
// contracts stay pinned to 0.8.20 so their bytecode does not change. Each source
// file is pinned explicitly below — nothing silently drifts to another compiler.
// `cancun` is required: OZ 5.6's utils/Bytes.sol (pulled in via Strings) uses the
// MCOPY opcode. BSC enabled the Cancun opcode set in the Pascal hard fork, so
// this is safe on both BSC mainnet and testnet.
const settings24 = { ...settings, evmVersion: "cancun" };

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20", settings },
      { version: "0.8.24", settings: settings24 }
    ],
    overrides: {
      "contracts/BlockLabelToken.sol": { version: "0.8.20", settings },
      "contracts/TeamLockup.sol": { version: "0.8.20", settings },
      "contracts/BDLAirdropDistributor.sol": { version: "0.8.20", settings },
      "contracts/BlockLabelCertificateNFT.sol": { version: "0.8.24", settings: settings24 }
    }
  },
  networks: {
    bscTestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001"]
    },
    bscMainnet: {
      url: "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001"]
    }
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY || ""
  },
  sourcify: {
    enabled: false
  }
};
