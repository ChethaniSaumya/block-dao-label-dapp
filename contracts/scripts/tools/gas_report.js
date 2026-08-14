/**
 * Measures issuance gas so the ops console's batch ceiling stays honest.
 *   npx hardhat run scripts/tools/gas_report.js
 */
const { ethers } = require("hardhat");

async function main() {
  const [, safe, ops, buyer] = await ethers.getSigners();
  const NFT = await ethers.getContractFactory("BlockLabelCertificateNFT");
  const n = await NFT.deploy(
    "Block Label Creator DAO Certificate",
    "BLDAO",
    safe.address,
    ops.address,
    "ipfs://cid/",
    "ipfs://cid/collection.json",
    safe.address,
    500,
    10_000
  );
  await n.waitForDeployment();

  const rows = [];
  rows.push(["deploy", (await n.deploymentTransaction().wait()).gasUsed, 1]);

  let r = await (await n.connect(ops).issueCertificate(buyer.address)).wait();
  rows.push(["issueCertificate (first)", r.gasUsed, 1]);

  r = await (await n.connect(ops).issueCertificate(buyer.address)).wait();
  rows.push(["issueCertificate (steady)", r.gasUsed, 1]);

  r = await (await n.connect(ops).issueSpecific(buyer.address, 5_000)).wait();
  rows.push(["issueSpecific", r.gasUsed, 1]);

  for (const qty of [10, 50, 100]) {
    r = await (await n.connect(ops).issueCertificateBatch(safe.address, qty)).wait();
    rows.push([`issueCertificateBatch(${qty})`, r.gasUsed, qty]);
  }

  const recips = Array(50).fill(buyer.address);
  r = await (await n.connect(ops).issueCertificates(recips)).wait();
  rows.push(["issueCertificates(50)", r.gasUsed, 50]);

  console.log("\n| action | gas | per certificate |");
  console.log("| --- | --- | --- |");
  for (const [label, gas, n_] of rows) {
    const per = n_ > 1 ? Math.round(Number(gas) / n_).toLocaleString() : "—";
    console.log(`| ${label} | ${Number(gas).toLocaleString()} | ${per} |`);
  }

  const block = await ethers.provider.getBlock("latest");
  console.log(`\nlocal block gas limit: ${Number(block.gasLimit).toLocaleString()}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
