/**
 * End-to-end check of build_airdrop_round.js: deploys a distributor locally,
 * loads the generated proof file, and claims for every entry in it.
 *
 *   node scripts/build_airdrop_round.js --claim 0xA=200000 --claim 0xB=150000 --dry-run
 *   npx hardhat run scripts/tools/verify_round_proofs.js
 */
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const file = path.join(__dirname, "../../deployments/demo-round1.json");
  const round = JSON.parse(fs.readFileSync(file, "utf8"));
  const entries = Object.values(round.entries);
  console.log(`Loaded round ${round.round}: ${entries.length} claim(s), root ${round.root}`);

  const [deployer] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("BlockLabelToken");
  const token = await Token.deploy("Block DAO Label", "BDL", 10_000_000_000n);
  await token.waitForDeployment();

  const Dist = await ethers.getContractFactory("BDLAirdropDistributor");
  const dist = await Dist.deploy(await token.getAddress(), deployer.address);
  await dist.waitForDeployment();

  const total = entries.reduce((s, e) => s + BigInt(e.amount), 0n);
  await (await token.transfer(await dist.getAddress(), total)).wait();
  await (await dist.setRoot(round.round, round.root)).wait();

  let ok = 0;
  for (const e of entries) {
    const before = await token.balanceOf(e.account);
    await (await dist.claim(round.round, e.index, e.account, e.amount, e.proof)).wait();
    const gained = (await token.balanceOf(e.account)) - before;
    const pass = gained === BigInt(e.amount);
    console.log(
      `  ${pass ? "OK  " : "FAIL"}  ${e.account}  +${ethers.formatUnits(gained, 18)} BDL`
    );
    if (pass) ok++;
  }

  // A forged proof must be rejected.
  const victim = entries[0];
  let rejected = false;
  try {
    await dist.claim(round.round, victim.index, victim.account, BigInt(victim.amount) * 2n, victim.proof);
  } catch {
    rejected = true;
  }
  console.log(`  ${rejected ? "OK  " : "FAIL"}  inflated amount rejected`);

  if (ok !== entries.length || !rejected) throw new Error("proof verification failed");
  console.log(`\nAll ${entries.length} proof(s) verified against the real distributor.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
