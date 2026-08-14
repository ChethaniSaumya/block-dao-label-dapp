require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Builds a BDL airdrop round: Merkle tree -> proof file -> on-chain root.
 *
 * Needed to let anyone other than the original demo wallet claim. The proof file
 * the dApp reads (`public/demo-round1.json`) only contains addresses that were
 * in the tree when the root was set, so a new tester must be added here first.
 *
 *   # who gets what (whole BDL)
 *   node scripts/build_airdrop_round.js --round 1 \
 *        --claim 0xYourWallet=200000 --claim 0xClientWallet=200000
 *
 *   # write the proof files but do NOT touch the chain
 *   node scripts/build_airdrop_round.js --claim 0xYou=200000 --dry-run
 *
 *   # push the root on-chain (needs ROOT_MANAGER_ROLE — the deployer key)
 *   npx hardhat run scripts/build_airdrop_round.js --network bscTestnet
 *   #  ^ hardhat run doesn't forward flags; use CLAIMS env instead:
 *   #    CLAIMS="0xYou=200000,0xClient=200000" npx hardhat run ... --network bscTestnet
 *
 * Leaf format matches BDLAirdropDistributor:
 *   keccak256(abi.encodePacked(index, account, amount))
 * with OpenZeppelin's commutative (sorted-pair) hashing.
 */

const DECIMALS = 18n;

function parseArgs(argv) {
  const args = { claim: [] };
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    const value = next === undefined || next.startsWith("--") ? true : (i++, next);
    if (key === "claim") args.claim.push(value);
    else args[key] = value;
  }
  return args;
}

// ── Merkle helpers (mirror of the contract's verification) ─────────────────
const leafHash = (index, account, amount) =>
  hre.ethers.solidityPackedKeccak256(
    ["uint256", "address", "uint256"],
    [index, account, amount]
  );

const hashPair = (a, b) => {
  const [x, y] = a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a];
  return hre.ethers.keccak256(hre.ethers.concat([x, y]));
};

function buildLayers(leaves) {
  let layer = leaves.slice();
  const layers = [layer];
  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      next.push(i + 1 < layer.length ? hashPair(layer[i], layer[i + 1]) : layer[i]);
    }
    layer = next;
    layers.push(layer);
  }
  return layers;
}

function getProof(layers, index) {
  const proof = [];
  let idx = index;
  for (let l = 0; l < layers.length - 1; l++) {
    const pairIdx = idx ^ 1;
    if (pairIdx < layers[l].length) proof.push(layers[l][pairIdx]);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // `npx hardhat run` swallows custom flags, so accept CLAIMS="addr=amt,addr=amt".
  const rawClaims = process.env.CLAIMS
    ? process.env.CLAIMS.split(",").map((s) => s.trim()).filter(Boolean)
    : args.claim;

  if (!rawClaims.length) {
    throw new Error(
      'No claims given. Use --claim 0xWallet=200000 (repeatable) or CLAIMS="0xWallet=200000,..."'
    );
  }

  const round = Number(process.env.ROUND || args.round || 1);
  const dryRun = !!args["dry-run"] || process.env.DRY_RUN === "true";

  // ── Parse + validate ────────────────────────────────────────────────────
  const claims = rawClaims.map((entry, index) => {
    const [addr, whole] = String(entry).split("=");
    if (!addr || !whole) throw new Error(`Malformed claim "${entry}" — expected 0xWallet=200000`);
    if (!hre.ethers.isAddress(addr.trim())) throw new Error(`Invalid address: ${addr}`);
    if (!/^\d+$/.test(whole.trim())) throw new Error(`Amount must be a whole number: ${whole}`);
    return {
      index,
      account: hre.ethers.getAddress(addr.trim()),
      amount: (BigInt(whole.trim()) * 10n ** DECIMALS).toString(),
      whole: whole.trim(),
    };
  });

  const seen = new Set();
  for (const c of claims) {
    const key = c.account.toLowerCase();
    if (seen.has(key)) throw new Error(`Duplicate address in round: ${c.account}`);
    seen.add(key);
  }

  // ── Build the tree ──────────────────────────────────────────────────────
  const leaves = claims.map((c) => leafHash(c.index, c.account, c.amount));
  const layers = buildLayers(leaves);
  const root = layers[layers.length - 1][0];

  const entries = {};
  let total = 0n;
  for (const c of claims) {
    entries[c.account.toLowerCase()] = {
      index: c.index,
      account: c.account,
      amount: c.amount,
      proof: getProof(layers, c.index),
    };
    total += BigInt(c.amount);
  }

  const payload = { round, root, count: claims.length, entries };

  console.log(`Round ${round} — ${claims.length} claim(s)`);
  for (const c of claims) {
    console.log(`  ${c.account}  ${Number(c.whole).toLocaleString()} BDL`);
  }
  console.log(`  total: ${hre.ethers.formatUnits(total, 18)} BDL`);
  console.log(`  root : ${root}`);

  // ── Write the proof files the dApp + backend read ───────────────────────
  const targets = [
    path.join(__dirname, "../../public/demo-round1.json"),
    path.join(__dirname, "../deployments/demo-round1.json"),
  ];
  for (const file of targets) {
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    console.log(`  wrote ${path.relative(path.join(__dirname, "../.."), file)}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: root NOT written on-chain.");
    return;
  }

  // ── Push the root on-chain ──────────────────────────────────────────────
  const distributor = process.env.DISTRIBUTOR_ADDRESS || process.env.VITE_DISTRIBUTOR_ADDRESS;
  if (!distributor || !hre.ethers.isAddress(distributor)) {
    console.log(
      "\nDISTRIBUTOR_ADDRESS not set — proof files written, but the on-chain root is unchanged." +
        "\nSet DISTRIBUTOR_ADDRESS in contracts/.env and re-run with --network bscTestnet."
    );
    return;
  }
  if (hre.network.name === "hardhat") {
    console.log(
      "\nRunning on the in-memory 'hardhat' network — nothing was sent." +
        "\nRe-run with:  npx hardhat run scripts/build_airdrop_round.js --network bscTestnet"
    );
    return;
  }

  const [signer] = await hre.ethers.getSigners();
  const dist = await hre.ethers.getContractAt("BDLAirdropDistributor", distributor, signer);

  const ROOT_MANAGER_ROLE = hre.ethers.id("ROOT_MANAGER_ROLE");
  if (!(await dist.hasRole(ROOT_MANAGER_ROLE, signer.address))) {
    throw new Error(
      `${signer.address} does not hold ROOT_MANAGER_ROLE on ${distributor}. ` +
        `Use the deployer key, or have the role holder call setRoot(${round}, ${root}).`
    );
  }

  const funded = await (
    await hre.ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
      await dist.token()
    )
  ).balanceOf(distributor);
  if (funded < total) {
    console.log(
      `\nWARNING: distributor holds ${hre.ethers.formatUnits(funded, 18)} BDL but this round ` +
        `needs ${hre.ethers.formatUnits(total, 18)} BDL. Claims will revert until it is funded.`
    );
  }

  const tx = await dist.setRoot(round, root);
  console.log(`\n  setRoot tx: ${tx.hash}`);
  await tx.wait();

  const onChain = await dist.roots(round);
  if (onChain.toLowerCase() !== root.toLowerCase()) {
    throw new Error(`Root mismatch after tx: on-chain ${onChain}, expected ${root}`);
  }
  console.log(`  confirmed on-chain root for round ${round}: ${onChain}`);
  console.log(`\nTesters can now claim at /airdrop with VITE_DEMO_MODE=true.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
