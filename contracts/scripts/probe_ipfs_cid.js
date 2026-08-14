#!/usr/bin/env node
/**
 * Probes the client's Pinata image CID to work out how the 10,000 files are
 * actually named, before 10,000 metadata files are generated against a guess.
 *
 *   node scripts/probe_ipfs_cid.js
 *   node scripts/probe_ipfs_cid.js --gateway https://<their>.mypinata.cloud/ipfs/
 *   node scripts/probe_ipfs_cid.js --cid bafy... --gateway https://dweb.link/ipfs/
 *
 * It tries a directory listing first, then falls back to HEAD-ing a list of
 * common naming patterns. Whatever comes back as 200 is the pattern to put in
 * nft-collection.json.
 *
 * NOTE: a public gateway can only serve content it can find on the DHT. If the
 * files are pinned only on the client's private Pinata account, use their
 * dedicated gateway (…mypinata.cloud) — ask the client for that URL.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TIMEOUT_MS = 20_000;

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

const pad = (n, w) => String(n).padStart(w, "0");

/** Candidate file-name patterns, ordered by how common they are. */
function candidates(padWidth) {
  const patterns = [];
  for (const ext of ["png", "jpg", "jpeg", "webp", "gif", "json", ""]) {
    const suffix = ext ? `.${ext}` : "";
    patterns.push({ pattern: `{id}${suffix}`, sample: (id) => `${id}${suffix}` });
    patterns.push({
      pattern: `{pad}${suffix}`,
      sample: (id) => `${pad(id, padWidth)}${suffix}`,
    });
    patterns.push({
      pattern: `BLDAO-{pad}${suffix}`,
      sample: (id) => `BLDAO-${pad(id, padWidth)}${suffix}`,
    });
  }
  return patterns;
}

async function head(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Some gateways don't answer HEAD; a 1-byte ranged GET is more reliable.
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      signal: ctrl.signal,
    });
    return { ok: res.status >= 200 && res.status < 300, status: res.status, type: res.headers.get("content-type") };
  } catch (err) {
    return { ok: false, status: 0, error: err.name === "AbortError" ? "timeout" : err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function listDirectory(gateway, cid) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${gateway}${cid}/`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Gateways return either a JSON listing or an HTML index page.
    const names = new Set();
    for (const m of text.matchAll(/href="[^"]*\/([^"/?]+)"/g)) names.add(m[1]);
    for (const m of text.matchAll(/"Name"\s*:\s*"([^"]+)"/g)) names.add(m[1]);
    return names.size ? [...names].slice(0, 20) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "nft-collection.json"), "utf8"));

  const cid = args.cid || cfg.image.cid;
  let gateway = args.gateway || cfg.image.gateway || "https://ipfs.io/ipfs/";
  if (!gateway.endsWith("/")) gateway += "/";

  console.log(`CID     : ${cid}`);
  console.log(`Gateway : ${gateway}\n`);

  // Reachability first: if the gateway cannot resolve the CID at all, grinding
  // through 20+ file-name candidates just multiplies the same timeout.
  const root = await head(`${gateway}${cid}`);
  if (!root.ok && (root.status === 0 || root.status >= 500)) {
    console.log(
      `Gateway cannot resolve this CID (${root.error || `HTTP ${root.status}`}).\n\n` +
        `The content is most likely pinned only on the client's private Pinata account\n` +
        `and has not propagated to the public IPFS network. Ask the client for:\n` +
        `  • their dedicated gateway URL — https://<name>.mypinata.cloud/ipfs/\n` +
        `  • one example full image URL (certificate #1 and #10000)\n\n` +
        `Then re-run:  npm run nft:probe -- --gateway https://<name>.mypinata.cloud/ipfs/`
    );
    process.exitCode = 1;
    return;
  }

  const listing = await listDirectory(gateway, cid);
  if (listing) {
    console.log("Directory listing (first entries):");
    for (const name of listing) console.log(`  ${name}`);
    console.log("");
  } else {
    console.log("No directory listing available from this gateway.\n");
  }

  console.log("Probing file-name patterns (token id 1 and 10000):");
  const found = [];
  for (const c of candidates(cfg.serialPadding)) {
    const first = await head(`${gateway}${cid}/${c.sample(1)}`);
    if (!first.ok) continue;
    const last = await head(`${gateway}${cid}/${c.sample(10000)}`);
    found.push({ ...c, first, last });
    console.log(
      `  MATCH  ${c.pattern.padEnd(18)} -> ${c.sample(1)} [${first.status} ${first.type || ""}]` +
        `  |  ${c.sample(10000)} [${last.status}]`
    );
  }

  if (!found.length) {
    console.log("  no pattern resolved.\n");
    console.log("This means one of:");
    console.log("  1. The gateway cannot reach the content (private Pinata pin) —");
    console.log("     ask the client for their dedicated gateway: https://<name>.mypinata.cloud/ipfs/");
    console.log("  2. The CID points at a single file, not a directory of 10,000.");
    console.log("  3. The files use a naming scheme not in the candidate list —");
    console.log("     ask the client for one example full URL of NFT #1 and #10000.");
    process.exitCode = 1;
    return;
  }

  const best = found[0];
  console.log(`\nUse this in nft-collection.json:  "pattern": "${best.pattern}"`);
  if (!best.last.ok) {
    console.log(
      `WARNING: ${best.sample(10000)} did not resolve (${best.last.status}) — the directory may be` +
        ` 0-indexed (set "startIndex": 0) or hold fewer than 10,000 files.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
