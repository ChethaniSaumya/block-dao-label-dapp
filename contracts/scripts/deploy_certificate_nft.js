require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deploys the Block Label Creator DAO Certificate (BEP-721).
 *
 *   Admin / owner / PAUSER  -> NFT_ADMIN_ADDRESS   (Foundation Safe multisig)
 *   MINTER_ROLE             -> NFT_MINTER_ADDRESS  (operations wallet)
 *   Royalty receiver        -> NFT_ROYALTY_RECEIVER (defaults to the Safe)
 *
 * The deploying key is a throw-away: it holds NO role after deployment, which
 * the script asserts before it writes the deployment record.
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "../nft-collection.json"), "utf8"));

  const name = process.env.NFT_NAME || cfg.collection.name;
  const symbol = process.env.NFT_SYMBOL || cfg.collection.symbol;
  const admin = process.env.NFT_ADMIN_ADDRESS;
  const minter = process.env.NFT_MINTER_ADDRESS;
  const royaltyReceiver =
    process.env.NFT_ROYALTY_RECEIVER || cfg.collection.royaltyReceiver || admin;
  const royaltyBps = Number(process.env.NFT_ROYALTY_BPS || cfg.collection.royaltyBps || 500);

  // `ipfs://<metadata CID>/` — the metadata folder, NOT the image folder.
  const maxSupply = BigInt(process.env.NFT_MAX_SUPPLY || cfg.supply || 10000);
  const baseURI = process.env.NFT_BASE_URI || "";
  const contractURI = process.env.NFT_CONTRACT_URI || (baseURI ? `${baseURI}collection.json` : "");

  // ── Pre-flight ──────────────────────────────────────────────────────────
  const problems = [];
  for (const [label, value] of [
    ["NFT_ADMIN_ADDRESS", admin],
    ["NFT_MINTER_ADDRESS", minter],
    ["NFT_ROYALTY_RECEIVER", royaltyReceiver],
  ]) {
    if (!value) problems.push(`${label} is not set`);
    else if (!hre.ethers.isAddress(value)) problems.push(`${label} is not a valid address: ${value}`);
  }
  if (admin && minter && admin.toLowerCase() === minter.toLowerCase()) {
    problems.push("NFT_ADMIN_ADDRESS and NFT_MINTER_ADDRESS must be different wallets");
  }

  // A hot deploy key must never keep admin power on a production collection.
  // Testnet rehearsals legitimately want it (so the tester can exercise the
  // admin panel), so allow it behind an explicit opt-in — never on mainnet.
  const deployerIsAdmin = admin && admin.toLowerCase() === deployer.address.toLowerCase();
  const rehearsal = process.env.ALLOW_DEPLOYER_AS_ADMIN === "true";
  if (deployerIsAdmin) {
    if (hre.network.name === "bscMainnet") {
      problems.push(
        "NFT_ADMIN_ADDRESS is the deployer key. On mainnet the admin must be the " +
          "Foundation Safe multisig — refusing regardless of ALLOW_DEPLOYER_AS_ADMIN."
      );
    } else if (!rehearsal) {
      problems.push(
        "NFT_ADMIN_ADDRESS is the deployer key. That is only appropriate for a " +
          "testnet rehearsal — set ALLOW_DEPLOYER_AS_ADMIN=true to confirm."
      );
    }
  }
  if (royaltyBps > 1000) problems.push(`NFT_ROYALTY_BPS ${royaltyBps} exceeds the 10% default royalty ceiling`);
  if (maxSupply <= 0n) problems.push(`NFT_MAX_SUPPLY must be positive`);
  if (!baseURI) {
    problems.push(
      "NFT_BASE_URI is not set — generate + pin the metadata first (npm run nft:metadata, npm run nft:pin)"
    );
  } else if (!baseURI.endsWith("/")) {
    problems.push(`NFT_BASE_URI must end with a slash: ${baseURI}`);
  }
  if (problems.length) {
    throw new Error(`Pre-flight failed:\n  - ${problems.join("\n  - ")}`);
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Network        : ${hre.network.name}`);
  console.log(`Deployer       : ${deployer.address} (${hre.ethers.formatEther(balance)} BNB)`);
  console.log(`Collection     : ${name} (${symbol})`);
  console.log(`Admin / owner  : ${admin}`);
  console.log(`Minter (ops)   : ${minter}`);
  console.log(`Royalty        : ${royaltyBps / 100}% -> ${royaltyReceiver}`);
  console.log(`Max supply     : ${maxSupply} (lowerable later, never raisable)`);
  console.log(`Base URI       : ${baseURI}`);
  console.log(`Contract URI   : ${contractURI}`);
  if (deployerIsAdmin) {
    console.log(
      `\n*** REHEARSAL DEPLOYMENT ***\n` +
        `The deploy key also holds DEFAULT_ADMIN_ROLE. Fine for testing on ` +
        `${hre.network.name}; never do this for the production collection.`
    );
  }
  console.log("");

  // ── Deploy ──────────────────────────────────────────────────────────────
  const NFT = await hre.ethers.getContractFactory("BlockLabelCertificateNFT");
  const nft = await NFT.deploy(
    name,
    symbol,
    admin,
    minter,
    baseURI,
    contractURI,
    royaltyReceiver,
    royaltyBps,
    maxSupply
  );
  await nft.waitForDeployment();
  const address = await nft.getAddress();
  console.log(`BlockLabelCertificateNFT deployed to: ${address}`);

  // ── Post-deploy invariants ──────────────────────────────────────────────
  const ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
  const MINTER_ROLE = await nft.MINTER_ROLE();
  const PAUSER_ROLE = await nft.PAUSER_ROLE();

  const checks = [
    ["owner is the admin address", (await nft.owner()).toLowerCase() === admin.toLowerCase()],
    ["admin holds DEFAULT_ADMIN_ROLE", await nft.hasRole(ADMIN_ROLE, admin)],
    ["admin holds PAUSER_ROLE", await nft.hasRole(PAUSER_ROLE, admin)],
    ["ops wallet holds MINTER_ROLE", await nft.hasRole(MINTER_ROLE, minter)],
    ["ops wallet has NO admin role", !(await nft.hasRole(ADMIN_ROLE, minter))],
    [
      deployerIsAdmin
        ? "deployer holds admin (REHEARSAL — intended)"
        : "deployer has NO admin role",
      deployerIsAdmin
        ? await nft.hasRole(ADMIN_ROLE, deployer.address)
        : !(await nft.hasRole(ADMIN_ROLE, deployer.address)),
    ],
    ["deployer has NO minter role", !(await nft.hasRole(MINTER_ROLE, deployer.address))],
    ["supply cap matches config", (await nft.maxSupply()) === maxSupply],
    ["nothing issued yet", (await nft.totalIssued()) === 0n],
    ["rounds seeded", (await nft.roundCount()) > 0n],
    ["serial format seeded", (await nft.serialOf(1)).length > 0],
  ];
  console.log("\nPost-deploy checks:");
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}`);
    if (!ok) throw new Error(`Invariant failed: ${label}. Do NOT use this deployment.`);
  }

  // ── Record ──────────────────────────────────────────────────────────────
  const deployment = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    certificateNFT: {
      address,
      name,
      symbol,
      admin,
      minter,
      baseURI,
      contractURI,
      royaltyReceiver,
      royaltyBps,
      maxSupply: Number(maxSupply),
      rounds: (await nft.getRounds()).map((r) => ({
        from: Number(r.from),
        to: Number(r.to),
        bdlAirdrop: Number(r.bdlAirdrop),
      })),
      abi: JSON.parse(nft.interface.formatJson()),
    },
    deployedAt: new Date().toISOString(),
  };

  const dir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  fs.writeFileSync(
    path.join(dir, `certificate-nft.${hre.network.name}.json`),
    JSON.stringify(deployment, null, 2)
  );
  console.log(`\nSaved deployments/certificate-nft.${hre.network.name}.json`);

  console.log(`\nAdd to the dApp .env:`);
  console.log(`VITE_CERTIFICATE_NFT_ADDRESS=${address}`);

  console.log(`\nVerify on BscScan:`);
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${address} ` +
      `"${name}" "${symbol}" ${admin} ${minter} "${baseURI}" "${contractURI}" ${royaltyReceiver} ${royaltyBps} ${maxSupply}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
