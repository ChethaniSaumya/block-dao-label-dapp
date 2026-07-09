require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
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
