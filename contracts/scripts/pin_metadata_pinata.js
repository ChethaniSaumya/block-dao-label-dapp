#!/usr/bin/env node
/**
 * Pins the generated `metadata/` folder to the client's Pinata account as a
 * single IPFS directory, so the contract can point at `ipfs://<CID>/{id}.json`.
 *
 *   PINATA_JWT=eyJ... node scripts/pin_metadata_pinata.js
 *   node scripts/pin_metadata_pinata.js --dir ./metadata --name "BLDAO metadata v1"
 *   node scripts/pin_metadata_pinata.js --dry-run
 *
 * Requires PINATA_JWT in contracts/.env (Pinata → API Keys → admin or
 * pinFileToIPFS scope). The client can equally upload the folder by hand in the
 * Pinata dashboard — this script just makes it repeatable.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dir = path.resolve(args.dir || path.join(ROOT, "metadata"));
  const folderName = args.name || "blocklabel-certificate-metadata";

  if (!fs.existsSync(dir)) {
    throw new Error(`${dir} does not exist — run \`npm run nft:metadata\` first.`);
  }

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0));

  if (!files.length) throw new Error(`No .json files in ${dir}`);

  const bytes = files.reduce((sum, f) => sum + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`Pinning ${files.length} files (${(bytes / 1024 / 1024).toFixed(2)} MB) from ${dir}`);

  if (args["dry-run"]) {
    console.log("--dry-run: nothing uploaded.");
    console.log(`First file: ${files[0]}, last file: ${files[files.length - 1]}`);
    return;
  }

  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is not set (put it in contracts/.env)");

  const form = new FormData();
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    // The `${folderName}/` prefix is what makes Pinata store this as a directory.
    form.append("file", new Blob([buf], { type: "application/json" }), `${folderName}/${f}`);
  }
  form.append("pinataMetadata", JSON.stringify({ name: folderName }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1, wrapWithDirectory: false }));

  const res = await fetch(PINATA_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Pinata returned ${res.status}: ${text}`);

  const { IpfsHash: cid, PinSize } = JSON.parse(text);
  console.log(`\nPinned. Metadata CID: ${cid}  (${PinSize} bytes)`);
  console.log(`Base URI for the contract:  ipfs://${cid}/`);
  console.log(`Spot check:                 https://ipfs.io/ipfs/${cid}/1.json`);
  console.log(`\nSet it on-chain from the Safe:  setBaseURI("ipfs://${cid}/")`);

  fs.writeFileSync(
    path.join(ROOT, "deployments", "metadata-cid.json"),
    JSON.stringify({ cid, baseURI: `ipfs://${cid}/`, files: files.length, pinnedAt: new Date().toISOString() }, null, 2)
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
