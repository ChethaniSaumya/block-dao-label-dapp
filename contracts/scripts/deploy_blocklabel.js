require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploys the Block Label (BDL) token + TeamLockup and wires the tokenomics:
 *
 *   Total supply        : 10,000,000,000 BDL  (minted to deployer initially)
 *   Team allocation      :  1,000,000,000 BDL  -> transferred into TeamLockup (locked)
 *   Non-team ecosystem   :  9,000,000,000 BDL  -> instantly distributed to allocations.json wallets
 *
 * The TeamLockup tracks burn progress against the total supply and burns the
 * team allocation proportionally; at the 50% milestone the remainder unlocks.
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const name = process.env.TOKEN_NAME || "Block DAO Label";
  const symbol = process.env.TOKEN_SYMBOL || "BDL";

  // Whole-token figures (decimals applied on-chain).
  const totalSupply = BigInt(process.env.TOTAL_SUPPLY || "10000000000"); // 10B
  const teamAllocationWhole = BigInt(process.env.TEAM_ALLOCATION || "1000000000"); // 1B

  // 0x…dEaD by default — the canonical hold-address for non-team burns.
  const officialBurnAddress =
    process.env.OFFICIAL_BURN_ADDRESS ||
    "0x000000000000000000000000000000000000dEaD";

  const decimals = 18n;
  const toWei = (whole) => whole * 10n ** decimals;

  console.log(`Deployer: ${deployer.address}`);
  console.log(`Deploying ${name} (${symbol}) total supply ${totalSupply}...`);

  // 1. Token
  const Token = await hre.ethers.getContractFactory("BlockLabelToken");
  const token = await Token.deploy(name, symbol, totalSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`BlockLabelToken deployed to: ${tokenAddress}`);

  // 2. TeamLockup — burn base is TOTAL supply (Whitepaper §5.1)
  const Lockup = await hre.ethers.getContractFactory("TeamLockup");
  const lockup = await Lockup.deploy(
    tokenAddress,
    officialBurnAddress,
    toWei(teamAllocationWhole),
    toWei(totalSupply),
    deployer.address
  );
  await lockup.waitForDeployment();
  const lockupAddress = await lockup.getAddress();
  console.log(`TeamLockup deployed to:      ${lockupAddress}`);

  // 3. Lock the team allocation: move 1B BDL into the lockup.
  let tx = await token.transfer(lockupAddress, toWei(teamAllocationWhole));
  await tx.wait();
  console.log(`Locked ${teamAllocationWhole} ${symbol} into TeamLockup.`);

  // 4. Distribute allocations from allocations.json
  const { allocations } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../allocations.json"), "utf8")
  );

  let distributed = 0n;
  let allocationRecords = [];

  for (const a of allocations) {
    if (!hre.ethers.isAddress(a.address)) {
      throw new Error(`Invalid address for allocation: ${a.name}`);
    }
    const amount = toWei(BigInt(a.amountWhole));
    const tx = await token.transfer(a.address, amount);
    const receipt = await tx.wait();
    distributed += amount;
    console.log(`Allocated ${a.amountWhole} ${symbol} -> ${a.name} (${a.address})`);
    
    allocationRecords.push({
      name: a.name,
      address: a.address,
      amountWhole: a.amountWhole,
      txHash: receipt.hash
    });
  }

  // Hard invariant: team lockup + distributed allocations must equal total supply.
  if (toWei(teamAllocationWhole) + distributed !== toWei(totalSupply)) {
    throw new Error("Allocation mismatch: distributed + team lockup != total supply. Aborting.");
  }

  const remaining = await token.balanceOf(deployer.address);
  if (remaining !== 0n) {
    throw new Error(`Deployer still holds ${remaining} — deployment invalid.`);
  }

  // 5. BDLAirdropDistributor — Merkle pull-claim (fund it with the airdrop pool later).
  const Dist = await hre.ethers.getContractFactory("BDLAirdropDistributor");
  const dist = await Dist.deploy(tokenAddress, deployer.address);
  await dist.waitForDeployment();
  const distAddress = await dist.getAddress();
  console.log(`BDLAirdropDistributor deployed to: ${distAddress}`);

  // Save deployment info.
  const deployment = {
    network: hre.network.name,
    deployer: deployer.address,
    token: {
      address: tokenAddress,
      name,
      symbol,
      totalSupply: totalSupply.toString(),
      abi: JSON.parse(token.interface.formatJson()),
    },
    teamLockup: {
      address: lockupAddress,
      officialBurnAddress,
      teamAllocation: teamAllocationWhole.toString(),
      totalSupplyBase: totalSupply.toString(),
      abi: JSON.parse(lockup.interface.formatJson()),
    },
    airdropDistributor: {
      address: distAddress,
      abi: JSON.parse(dist.interface.formatJson()),
    },
    allocations: allocationRecords,
    deployedAt: new Date().toISOString(),
  };

  const dir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(
    path.join(dir, `blocklabel.${hre.network.name}.json`),
    JSON.stringify(deployment, null, 2)
  );
  console.log(`\nSaved deployments/blocklabel.${hre.network.name}.json`);

  console.log(`\nVerify on BscScan:`);
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${tokenAddress} "${name}" "${symbol}" "${totalSupply}"`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${lockupAddress} ${tokenAddress} ${officialBurnAddress} ${toWei(teamAllocationWhole)} ${toWei(totalSupply)} ${deployer.address}`
  );
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${distAddress} ${tokenAddress} ${deployer.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
