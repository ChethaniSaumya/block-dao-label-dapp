#!/usr/bin/env node
/**
 * Generates the 10,000 Creator DAO Certificate metadata files from
 * `nft-collection.json` and the client's existing Pinata image CID.
 *
 * The images are ALREADY on IPFS (uploaded by the client) — this script never
 * uploads or re-hosts artwork, it only writes the JSON that points at them.
 *
 *   node scripts/generate_nft_metadata.js
 *   node scripts/generate_nft_metadata.js --pattern "{pad}.png" --start-index 0
 *   node scripts/generate_nft_metadata.js --cid bafy... --out ./metadata
 *
 * Output: metadata/1.json … metadata/10000.json  +  metadata/collection.json
 * Upload that folder to Pinata as a directory, then set the contract's
 * baseURI to `ipfs://<returned CID>/`.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

/** Zero-pads `n` to `width` digits: pad(7, 6) -> "000007". */
const pad = (n, width) => String(n).padStart(width, "0");

/** Resolves the image file name for a token id from the configured pattern. */
function imageFileName(tokenId, cfg) {
  const fileIndex = tokenId - 1 + cfg.image.startIndex;
  return cfg.image.pattern
    .replace(/{id}/g, String(fileIndex))
    .replace(/{pad}/g, pad(fileIndex, cfg.serialPadding));
}

/** Round descriptor for a token id, per Issuance Plan §13.2. */
function roundFor(tokenId, cfg) {
  const r = cfg.rounds.find((x) => tokenId >= x.from && tokenId <= x.to);
  if (!r) throw new Error(`No round covers token id ${tokenId} — check nft-collection.json`);
  return r;
}

function buildTokenMetadata(tokenId, cfg) {
  const round = roundFor(tokenId, cfg);
  const serial = `${cfg.serialPrefix}${pad(tokenId, cfg.serialPadding)}`;
  const c = cfg.collection;

  return {
    name: `${c.name} #${pad(tokenId, cfg.serialPadding)}`,
    description: c.description,
    image: `ipfs://${cfg.image.cid}/${imageFileName(tokenId, cfg)}`,
    external_url: `${c.externalUrl}/certificates/${tokenId}`,
    attributes: [
      { trait_type: "Certificate Number", value: serial },
      { trait_type: "Issuance Round", value: `Round ${round.round}` },
      { trait_type: "BDL Airdrop", value: round.bdlAirdrop, display_type: "number" },
      { trait_type: "Issuer", value: c.issuer },
      { trait_type: "Network", value: c.network },
      { trait_type: "Edition", value: `${tokenId} of ${cfg.supply}` },
    ],
    // Mirrored under `properties` for marketplaces/tools that read that shape.
    properties: {
      serialNumber: serial,
      tokenId,
      round: round.round,
      bdlAirdrop: String(round.bdlAirdrop),
      issuer: c.issuer,
    },
  };
}

function buildCollectionMetadata(cfg) {
  const c = cfg.collection;
  return {
    name: c.name,
    description: c.description,
    image: `ipfs://${cfg.image.cid}/${imageFileName(c.collectionImageTokenId || 1, cfg)}`,
    external_link: c.externalUrl,
    seller_fee_basis_points: c.royaltyBps,
    fee_recipient: c.royaltyReceiver,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfgPath = args.config ? path.resolve(args.config) : path.join(ROOT, "nft-collection.json");
  const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));

  // CLI overrides — handy for regenerating once the client confirms naming.
  if (args.cid) cfg.image.cid = args.cid;
  if (args.pattern) cfg.image.pattern = args.pattern;
  if (args["start-index"] !== undefined) cfg.image.startIndex = Number(args["start-index"]);

  const outDir = path.resolve(args.out || path.join(ROOT, "metadata"));

  if (!cfg.image.cid || cfg.image.cid.includes("<")) {
    throw new Error("image.cid is not set in nft-collection.json");
  }
  const totalRoundUnits = cfg.rounds.reduce((sum, r) => sum + (r.to - r.from + 1), 0);
  if (totalRoundUnits !== cfg.supply) {
    throw new Error(
      `Round ranges cover ${totalRoundUnits} certificates but supply is ${cfg.supply}`
    );
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const perRound = {};
  let totalBdl = 0n;

  for (let tokenId = 1; tokenId <= cfg.supply; tokenId++) {
    const meta = buildTokenMetadata(tokenId, cfg);
    fs.writeFileSync(path.join(outDir, `${tokenId}.json`), JSON.stringify(meta, null, 2));
    const r = meta.properties.round;
    perRound[r] = (perRound[r] || 0) + 1;
    totalBdl += BigInt(meta.properties.bdlAirdrop);
  }

  fs.writeFileSync(
    path.join(outDir, "collection.json"),
    JSON.stringify(buildCollectionMetadata(cfg), null, 2)
  );

  const sample = JSON.parse(fs.readFileSync(path.join(outDir, "1.json"), "utf8"));

  console.log(`Generated ${cfg.supply} metadata files -> ${outDir}`);
  console.log(`  image CID     : ${cfg.image.cid}`);
  console.log(`  image pattern : ${cfg.image.pattern} (token 1 -> ${imageFileName(1, cfg)})`);
  for (const r of cfg.rounds) {
    console.log(
      `  Round ${r.round}: ${perRound[r.round]} certs × ${r.bdlAirdrop.toLocaleString()} BDL` +
        `  (${cfg.serialPrefix}${pad(r.from, cfg.serialPadding)} … ${cfg.serialPrefix}${pad(r.to, cfg.serialPadding)})`
    );
  }
  console.log(`  Total BDL committed to certificate airdrops: ${totalBdl.toLocaleString()}`);
  console.log(`\nSample (metadata/1.json):\n${JSON.stringify(sample, null, 2)}`);
  console.log(
    `\nNext: verify the image links resolve  ->  node scripts/probe_ipfs_cid.js` +
      `\n      then pin the folder            ->  node scripts/pin_metadata_pinata.js`
  );
}

main();
