const { expect } = require("chai");
const { ethers } = require("hardhat");

// Whole tokens -> wei (18 decimals)
const W = (n) => ethers.parseUnits(n.toString(), 18);
const DEAD = "0x000000000000000000000000000000000000dEaD";

describe("TeamLockup — total-supply pro-rata burn & beneficiary claim", function () {
  let token, lockup, owner, a, b, c;
  const TOTAL = 10_000_000_000n; // 10B
  const TEAM = 1_000_000_000n; //  1B

  beforeEach(async function () {
    [owner, a, b, c] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("BlockLabelToken");
    token = await Token.deploy("Block DAO Label", "BDL", TOTAL);
    await token.waitForDeployment();

    const Lockup = await ethers.getContractFactory("TeamLockup");
    lockup = await Lockup.deploy(
      await token.getAddress(),
      DEAD,
      W(TEAM),
      W(TOTAL), // burn base = TOTAL supply (whitepaper §5.1)
      owner.address
    );
    await lockup.waitForDeployment();
    await token.transfer(await lockup.getAddress(), W(TEAM));
  });

  // Simulate a market buyback-burn by sending tokens to the official burn address.
  async function marketBurn(whole) {
    await token.transfer(DEAD, W(whole));
    await lockup.syncBurnFromAddress();
  }

  it("locks 100% of the team allocation and uses total-supply base", async function () {
    expect(await lockup.remainingLockedTeam()).to.equal(W(TEAM));
    expect(await lockup.totalSupplyBase()).to.equal(W(TOTAL));
    expect(await lockup.burnMilestone()).to.equal(W(TOTAL) / 2n); // 5B
    expect(await lockup.milestoneReached()).to.equal(false);
  });

  it("burns team pro-rata on total supply: 10% burn -> 100M team (whitepaper table)", async function () {
    await marketBurn(1_000_000_000n); // 1B = 10% of total
    expect(await lockup.teamAllocationBurned()).to.equal(W(100_000_000n));
    expect(await lockup.remainingLockedTeam()).to.equal(W(900_000_000n));
    expect(await lockup.burnProgressBps()).to.equal(1000n); // 10.00%
  });

  it("25% burn -> 250M team burned (whitepaper table)", async function () {
    await marketBurn(2_500_000_000n); // 2.5B = 25%
    expect(await lockup.teamAllocationBurned()).to.equal(W(250_000_000n));
    expect(await lockup.remainingLockedTeam()).to.equal(W(750_000_000n));
  });

  it("50% total burn (5B) -> 500M burned, 500M unlocks (whitepaper release trigger)", async function () {
    await marketBurn(5_000_000_000n); // 5B = 50% of total
    expect(await lockup.teamAllocationBurned()).to.equal(W(500_000_000n));
    expect(await lockup.remainingLockedTeam()).to.equal(W(500_000_000n));
    expect(await lockup.milestoneReached()).to.equal(true);
    expect(await lockup.bonusPoolUnlocked()).to.equal(true);
    expect(await lockup.unlockedPoolSnapshot()).to.equal(W(500_000_000n));
  });

  it("caps team burn at 50% even beyond the milestone", async function () {
    await marketBurn(5_000_000_000n);
    await marketBurn(2_000_000_000n); // 70% total
    expect(await lockup.teamAllocationBurned()).to.equal(W(500_000_000n));
    expect(await lockup.remainingLockedTeam()).to.equal(W(500_000_000n));
  });

  it("only true team burns reduce total supply", async function () {
    const before = await token.totalSupply();
    await marketBurn(1_000_000_000n); // 1B to dead is not a supply burn; 100M team is
    expect(before - (await token.totalSupply())).to.equal(W(100_000_000n));
  });

  it("supports the oracle path (monotonic)", async function () {
    await lockup.reportVerifiedBurn(W(2_000_000_000n)); // 20%
    expect(await lockup.teamAllocationBurned()).to.equal(W(200_000_000n));
    await expect(lockup.reportVerifiedBurn(W(1n))).to.be.revertedWith("must not decrease");
  });

  describe("beneficiary registration & claim", function () {
    beforeEach(async function () {
      // A:50%, B:30%, C:20% of the team allocation (weights in BDL terms)
      await lockup.registerBeneficiary(a.address, W(500_000_000n));
      await lockup.registerBeneficiary(b.address, W(300_000_000n));
      await lockup.registerBeneficiary(c.address, W(200_000_000n));
    });

    it("registers immutably and enforces the allocation cap", async function () {
      expect(await lockup.beneficiaryCount()).to.equal(3n);
      expect(await lockup.totalRegisteredAllocation()).to.equal(W(TEAM));
      await expect(
        lockup.registerBeneficiary(owner.address, W(1n))
      ).to.be.revertedWith("exceeds team alloc");
      await expect(
        lockup.registerBeneficiary(a.address, W(1n))
      ).to.be.revertedWith("already registered");
    });

    it("blocks claiming before milestone / finalize", async function () {
      await lockup.finalizeBeneficiaries();
      await expect(lockup.connect(a).claim()).to.be.revertedWith(
        "locked: milestone not reached"
      );
    });

    it("distributes the unlocked 500M pro-rata via pull claims", async function () {
      await lockup.finalizeBeneficiaries();
      await expect(lockup.registerBeneficiary(owner.address, W(1n))).to.be.revertedWith(
        "finalized"
      );
      await marketBurn(5_000_000_000n); // unlock (pool snapshot = 500M)

      // A: 500M * 50% = 250M ; B: 150M ; C: 100M
      expect(await lockup.claimableOf(a.address)).to.equal(W(250_000_000n));
      await lockup.connect(a).claim();
      await lockup.connect(b).claim();
      await lockup.connect(c).claim();
      expect(await token.balanceOf(a.address)).to.equal(W(250_000_000n));
      expect(await token.balanceOf(b.address)).to.equal(W(150_000_000n));
      expect(await token.balanceOf(c.address)).to.equal(W(100_000_000n));
      expect(await lockup.remainingLockedTeam()).to.equal(0);

      await expect(lockup.connect(a).claim()).to.be.revertedWith("already claimed");
    });
  });
});
