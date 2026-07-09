const { expect } = require("chai");
const { ethers } = require("hardhat");

const W = (n) => ethers.parseUnits(n.toString(), 18);

// ── Minimal Merkle tree matching OpenZeppelin MerkleProof (commutative/sorted) ──
const leafHash = (index, account, amount) =>
  ethers.solidityPackedKeccak256(["uint256", "address", "uint256"], [index, account, amount]);

const hashPair = (a, b) => {
  const [x, y] = a.toLowerCase() <= b.toLowerCase() ? [a, b] : [b, a];
  return ethers.keccak256(ethers.concat([x, y]));
};

function buildTree(leaves) {
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
    const layer = layers[l];
    const pairIdx = idx ^ 1;
    if (pairIdx < layer.length) proof.push(layer[pairIdx]);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

describe("BDLAirdropDistributor — Merkle pull claim", function () {
  let token, dist, owner, u1, u2, u3, u4;
  let claims, layers, root;

  beforeEach(async function () {
    [owner, u1, u2, u3, u4] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BlockLabelToken");
    token = await Token.deploy("Block DAO Label", "BDL", 10_000_000_000n);
    await token.waitForDeployment();

    const Dist = await ethers.getContractFactory("BDLAirdropDistributor");
    dist = await Dist.deploy(await token.getAddress(), owner.address);
    await dist.waitForDeployment();

    // Round 1 claim set (e.g. Early Bird 200,000 BDL each)
    claims = [
      { index: 0, account: u1.address, amount: W(200000) },
      { index: 1, account: u2.address, amount: W(150000) },
      { index: 2, account: u3.address, amount: W(120000) },
      { index: 3, account: u4.address, amount: W(100000) },
    ];
    const leaves = claims.map((c) => leafHash(c.index, c.account, c.amount));
    layers = buildTree(leaves);
    root = layers[layers.length - 1][0];

    // Fund the distributor and open round 1.
    await token.transfer(await dist.getAddress(), W(600000));
    await dist.setRoot(1, root);
  });

  it("lets a valid recipient claim exactly once", async function () {
    const proof = getProof(layers, 0);
    await expect(dist.claim(1, 0, u1.address, W(200000), proof))
      .to.emit(dist, "Claimed")
      .withArgs(1, 0, u1.address, W(200000));
    expect(await token.balanceOf(u1.address)).to.equal(W(200000));
    expect(await dist.isClaimed(1, 0)).to.equal(true);

    await expect(dist.claim(1, 0, u1.address, W(200000), proof)).to.be.revertedWith(
      "already claimed"
    );
  });

  it("rejects a wrong amount / forged proof", async function () {
    const proof = getProof(layers, 1);
    await expect(dist.claim(1, 1, u2.address, W(999999), proof)).to.be.revertedWith(
      "invalid proof"
    );
  });

  it("rejects claims for an unopened round", async function () {
    const proof = getProof(layers, 0);
    await expect(dist.claim(2, 0, u1.address, W(200000), proof)).to.be.revertedWith(
      "round not open"
    );
  });

  it("supports many independent claims in a round", async function () {
    for (const c of claims) {
      await dist.claim(1, c.index, c.account, c.amount, getProof(layers, c.index));
    }
    expect(await token.balanceOf(u3.address)).to.equal(W(120000));
    expect(await token.balanceOf(u4.address)).to.equal(W(100000));
  });

  it("only admin can set roots and sweep", async function () {
    await expect(dist.connect(u1).setRoot(2, root)).to.be.reverted;
    await dist.sweep(owner.address, W(30000));
    expect(await token.balanceOf(await dist.getAddress())).to.equal(W(570000));
  });
});
