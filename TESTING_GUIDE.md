# Testing Guide — Phase 1 (BDL) through the NFT Certificate

Your own verification pass, in order. Run this **before** handing anything to the
client. When it's green, send them `CLIENT_TEST_GUIDE.md`.

For the deep, contract-level NFT checks (compiler pinning, authority split,
adversarial tests) see `VERIFICATION_CHECKLIST.md` — this document is the
end-to-end pass across the whole product.

---

## 0. State of the world — read this first

Three findings from checking the live system today. They change what can be tested.

### 0.1 Phase-1 contracts are LIVE on BSC testnet ✅

Verified on-chain right now:

| What | Address | State |
| --- | --- | --- |
| BDL token | `0x7eE1E8089B397C582996e4baa1750947c7067F47` | "Block DAO Label" / BDL / 10,000,000,000 supply |
| Airdrop distributor | `0x711D8a207564C7a8428735f79B4528d0Faa36eb1` | funded with **5,000,000 BDL** |
| Team lockup | `0xCF98d8b36e82D3fCb5DCEC1EDbca860261FB66C8` | deployed |

Round 1 root is set and **index 0 is still unclaimed** — the demo claim works today.

### 0.2 Live URLs

| | |
| --- | --- |
| Frontend (Vercel) | https://block-dao-label-dapp.vercel.app |
| Backend (Render) | https://next-backend-vvev.onrender.com |

The Vercel deployment is **current** — the live bundle already contains the NFT
address `0xe3852Fae…8EfbF`, the `/certificates` and `/nft-admin` routes, and the
Pinata gateway.

### 0.3 The backend is DOWN — two separate faults ❌

**Fault 1 — the database is gone.** `backend/.env` points at
`hfdjdgfqmghsusldautu.supabase.co`, which returns **NXDOMAIN**; the Supabase
project was deleted. `server.js` exits code 1 on startup:

```
❌ Supabase connection failed: TypeError: fetch failed
```

That almost certainly explains why the Render service never answers — it boots,
fails on Supabase, exits, and Render restarts it forever. `/api/health` returned
nothing after 150 seconds; DNS resolves fine, so the host exists but nothing is
listening.

**Fault 2 — the deployed frontend never calls it anyway.** The live Vercel bundle
has `http://localhost:4000` compiled into it, because `VITE_BACKEND_API_URL` is
not set in Vercel's environment variables. `.env` is gitignored, so Vercel never
sees it — the variable has to be added in the Vercel dashboard and the project
redeployed.

Fixing fault 2 alone changes nothing while fault 1 stands. Consequences:

| Feature | Works without backend? |
| --- | --- |
| Wallet connect, network switch | ✅ |
| Dashboard BDL / BNB balances | ✅ on-chain reads |
| Team Vault & burn panel | ✅ on-chain reads |
| **Airdrop claim** (`VITE_DEMO_MODE=true`) | ✅ static proof file |
| **Certificates page** | ✅ on-chain reads |
| **NFT operations console** | ✅ on-chain reads/writes |
| Session signature / JWT | ❌ error toast on connect |
| `/admin` panel | ❌ |
| `/transactions`, `/profile`, `/referral` | ❌ |

**Decide before contacting the client:** either scope this test round to the
on-chain features (everything that matters for the NFT work), or restore the
backend first — which means a new Supabase project, rebuilding all eight tables
(no schema file exists in the repo), redeploying Render, and adding
`VITE_BACKEND_API_URL` in Vercel. The client guide as written assumes
**frontend-only, on-chain scope**.

### 0.4 `DEMO_AND_GOLIVE.md` is out of date ⚠

It describes `/staking`, `MockWkeyDAO2`, `WkeyDAO2Staking` and
`scripts/deploy_demo.js` — all deleted in the staking removal. Don't follow it,
and don't send it to the client. This file supersedes it.

---

## 1. Local build health (5 min)

```bash
cd contracts && npx hardhat clean && npx hardhat compile && npx hardhat test
```

**Expect** `Compiled 43 Solidity files successfully (evm targets: cancun, paris)`
and **`55 passing`**, no failures.

```bash
cd .. && npx vite build
```

**Expect** `✓ built in …`. (`npx tsc --noEmit -p tsconfig.app.json` shows ~26
errors — all pre-existing, none in the NFT files. See `VERIFICATION_CHECKLIST.md` §1.4.)

---

## 2. Put your own wallet in the airdrop round

The live Round 1 tree contains **one address only**:
`0x5B2c3BC037890A3d8a71111A6C8170C8c8E33cDE`. Unless you hold that key, you
cannot test a claim. Add yourself (and later the client) with the round builder:

```bash
cd contracts
# 1. Preview — writes the proof files, does not touch the chain
node scripts/build_airdrop_round.js --round 1 \
  --claim 0xYOUR_WALLET=200000 \
  --claim 0x5B2c3BC037890A3d8a71111A6C8170C8c8E33cDE=200000 --dry-run

# 2. Sanity-check the proofs against a real distributor locally
npx hardhat run scripts/tools/verify_round_proofs.js

# 3. Publish the new root on-chain (needs the deployer key = ROOT_MANAGER_ROLE)
DISTRIBUTOR_ADDRESS=0x711D8a207564C7a8428735f79B4528d0Faa36eb1 \
CLAIMS="0xYOUR_WALLET=200000,0x5B2c3BC037890A3d8a71111A6C8170C8c8E33cDE=200000" \
npx hardhat run scripts/build_airdrop_round.js --network bscTestnet
```

**Expect** step 2 to print `All N proof(s) verified` and step 3 to print
`confirmed on-chain root for round 1`.

> ⚠ Replacing the root **invalidates proofs for anyone not in the new list**, and
> already-claimed indexes stay claimed. Always include every tester in one list.
> Distributor holds 5,000,000 BDL — plenty for testing, but the script warns if a
> round exceeds it.

---

## 3. Phase 1 walkthrough (BSC testnet)

```bash
npm run dev      # http://localhost:8080
```

MetaMask on **BSC Testnet** (chainId 97). Free BNB: https://testnet.bnbchain.org/faucet-smart

| # | Do | Expect |
| --- | --- | --- |
| 3.1 | Open `/`, click Connect | Wallet connects. An auth error toast appears — that is §0.2, harmless |
| 3.2 | Wrong network on purpose | NetworkGuard blocks the page and offers to switch |
| 3.3 | `/dashboard` | BNB balance and BDL balance render from chain |
| 3.4 | `/dashboard` Team Vault panel | Allocation / burned / remaining figures load |
| 3.5 | `/airdrop` with a wallet **in** the round | Claimable amount shown |
| 3.6 | Click Claim, approve | Tx confirms; BDL balance rises by 200,000 |
| 3.7 | Reload `/airdrop` | Now shows already-claimed; a second claim reverts |
| 3.8 | `/airdrop` with a wallet **not** in the round | Shows not-eligible, no crash |
| 3.9 | `/about`, language toggle EN/한국어 | Copy switches, no missing-key gaps |

Anything under `/admin`, `/transactions`, `/profile`, `/referral` will error —
that is §0.2, not a regression.

---

## 4. NFT certificate walkthrough (BSC testnet)

Not deployed yet. Follow `contracts/NFT_ISSUANCE_GUIDE.md` §4, then
`VERIFICATION_CHECKLIST.md` Stage 5 in full. Condensed:

| # | Do | Expect |
| --- | --- | --- |
| 4.1 | `npm run nft:deploy:testnet` | All **11** post-deploy checks print `OK` |
| 4.2 | Run the printed `hardhat verify` | Green checkmark on testnet.bscscan.com |
| 4.3 | Set `VITE_CERTIFICATE_NFT_ADDRESS`, restart dev server | `/certificates` and `/nft-admin` come alive |
| 4.4 | Connect a random wallet to `/nft-admin` | "Access Denied" with the expected wallets listed |
| 4.5 | Connect **ops wallet** → issue to your phone wallet | Tx confirms; Issued 1, Next Serial BLDAO-000002 |
| 4.6 | Open the receiving wallet's NFT tab | Certificate appears (artwork blank until IPFS is fixed — expected) |
| 4.7 | Ops wallet → BscScan Write → `setBaseURI` | **Must revert.** If it succeeds, stop everything |
| 4.8 | Connect **Safe** → rename collection → rename back | `name()` changes on BscScan Read tab |
| 4.9 | Safe → `reduceMaxSupply(20000)` on BscScan | **Must revert** (`SupplyCannotIncrease`) |
| 4.10 | Ops → "Issue a specific serial" 888 | Issued; Next Serial still reads BLDAO-000002 |
| 4.11 | `/certificates` on the holding wallet | Card, serial, round, BDL amount, "Wholesale access granted" |
| 4.12 | Transfer the NFT away in the wallet app | Old wallet loses access, new wallet gains it |

---

## 5. Deployment for the client to test

The client should not run anything locally. Give them a URL.

```bash
npm run build        # dist/ — vercel.json is already configured
```

The project is already connected to Vercel at https://block-dao-label-dapp.vercel.app and redeploys on push. What
does **not** come across is `.env` — it is gitignored, so every variable must be
set in the Vercel dashboard under **Settings → Environment Variables**, then
redeployed:

```ini
VITE_NETWORK=bscTestnet
VITE_BSC_CHAIN_ID=97
VITE_DEMO_MODE=true
VITE_PROJECT_ID=<WalletConnect projectId>
VITE_TOKEN_CONTRACT_ADDRESS=0x7eE1E8089B397C582996e4baa1750947c7067F47
VITE_DISTRIBUTOR_ADDRESS=0x711D8a207564C7a8428735f79B4528d0Faa36eb1
VITE_TEAMLOCKUP_ADDRESS=0xCF98d8b36e82D3fCb5DCEC1EDbca860261FB66C8
VITE_CERTIFICATE_NFT_ADDRESS=<from step 4.1>
VITE_NFT_SAFE_WALLET=0xb09b2f5445eb54975876309fE94ec850C83e8902
VITE_NFT_OPS_WALLET=0x344c51E38eE0e71093bcFcF35648C7794A9d73F4
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_BACKEND_API_URL=https://next-backend-vvev.onrender.com
```

Check what actually shipped by grepping the live bundle:

```bash
curl -s https://block-dao-label-dapp.vercel.app/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1
# then fetch that file and grep it for the address or URL you expect
```

Then open the deployed URL yourself and repeat §3 and §4 against it before
sending. A build that works locally can still fail on Vercel through a missing
env var — the pages will show "not configured" if `VITE_CERTIFICATE_NFT_ADDRESS`
didn't make it across.

---

## 6. Before you send it to the client

- [ ] §1 green
- [ ] Client's wallet address obtained and added to the airdrop round (§2)
- [ ] §3 and §4 pass against the **deployed URL**, not just localhost
- [ ] You decided how to handle §0.2 (scope it out, or restore Supabase)
- [ ] You warned her the NFT artwork will be blank until she sends the Pinata
      gateway — otherwise she will report it as a bug
- [ ] Ops wallet and her test wallet both funded with testnet BNB
- [ ] She has `CLIENT_TEST_GUIDE.md`

---

## 7. Known limitations to state up front

1. **Testnet only.** Nothing here touches mainnet or real money.
2. **NFT artwork loads slowly.** The image naming is confirmed (`1.jpg` …
   `10000.jpg`) and the app points at `gateway.pinata.cloud`, but that shared
   gateway takes 8–36s per image and sometimes 404s until retried. It will look
   broken-then-fine. The client's dedicated gateway fixes it.
3. **Backend features are offline** (§0.2).
4. **The airdrop round is a demo tree** — a real round is built from the verified
   purchaser list, not by hand.
5. **`allocations.json` still holds placeholder addresses**
   (`0x1111…`, `0x2222…`). Mainnet BDL deployment is blocked until the client
   supplies the six real allocation wallets.
