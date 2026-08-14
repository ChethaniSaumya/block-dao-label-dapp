const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "Block Label Creator DAO Certificate";
const SYMBOL = "BLDAO";
const BASE_URI = "ipfs://bafyMetadataCID/";
const CONTRACT_URI = "ipfs://bafyMetadataCID/collection.json";
const ROYALTY_BPS = 500n; // 5%

describe("BlockLabelCertificateNFT — Creator DAO Certificate (BEP-721)", function () {
  let nft, safe, ops, buyer1, buyer2, stranger;

  const deploy = async (overrides = {}) => {
    const NFT = await ethers.getContractFactory("BlockLabelCertificateNFT");
    const c = await NFT.deploy(
      overrides.name ?? NAME,
      overrides.symbol ?? SYMBOL,
      overrides.admin ?? safe.address,
      overrides.minter ?? ops.address,
      overrides.baseURI ?? BASE_URI,
      overrides.contractURI ?? CONTRACT_URI,
      overrides.royaltyReceiver ?? safe.address,
      overrides.royaltyBps ?? ROYALTY_BPS,
      overrides.maxSupply ?? 10_000n
    );
    await c.waitForDeployment();
    return c;
  };

  beforeEach(async function () {
    [, safe, ops, buyer1, buyer2, stranger] = await ethers.getSigners();
    nft = await deploy();
  });

  describe("deployment & authority split", function () {
    it("sets collection identity and the 10,000 hard cap", async function () {
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
      expect(await nft.maxSupply()).to.equal(10_000n);
      expect(await nft.totalIssued()).to.equal(0n);
      expect(await nft.remainingSupply()).to.equal(10_000n);
      expect(await nft.nextTokenId()).to.equal(1n);
      expect(await nft.contractURI()).to.equal(CONTRACT_URI);
    });

    it("gives the Safe every admin power and the ops wallet only MINTER_ROLE", async function () {
      const ADMIN = await nft.DEFAULT_ADMIN_ROLE();
      const MINTER = await nft.MINTER_ROLE();
      const PAUSER = await nft.PAUSER_ROLE();

      expect(await nft.owner()).to.equal(safe.address);
      expect(await nft.hasRole(ADMIN, safe.address)).to.equal(true);
      expect(await nft.hasRole(PAUSER, safe.address)).to.equal(true);
      expect(await nft.hasRole(MINTER, ops.address)).to.equal(true);

      // The ops wallet is issuance-only.
      expect(await nft.hasRole(ADMIN, ops.address)).to.equal(false);
      expect(await nft.hasRole(PAUSER, ops.address)).to.equal(false);
    });

    it("leaves the deployer with no privileges at all", async function () {
      const [deployer] = await ethers.getSigners();
      const ADMIN = await nft.DEFAULT_ADMIN_ROLE();
      expect(await nft.hasRole(ADMIN, deployer.address)).to.equal(false);
      expect(await nft.hasRole(await nft.MINTER_ROLE(), deployer.address)).to.equal(false);
      expect(await nft.owner()).to.not.equal(deployer.address);
    });

    it("rejects zero addresses and an out-of-range royalty", async function () {
      // admin_ is caught first by Ownable's own constructor guard.
      await expect(deploy({ admin: ethers.ZeroAddress })).to.be.revertedWithCustomError(
        nft,
        "OwnableInvalidOwner"
      );
      await expect(deploy({ minter: ethers.ZeroAddress })).to.be.revertedWithCustomError(
        nft,
        "ZeroAddress"
      );
      await expect(deploy({ royaltyBps: 1001n })).to.be.revertedWithCustomError(
        nft,
        "RoyaltyTooHigh"
      );
    });
  });

  describe("issuance", function () {
    it("issues sequential serial numbers to confirmed buyers", async function () {
      await expect(nft.connect(ops).issueCertificate(buyer1.address))
        .to.emit(nft, "CertificateIssued")
        .withArgs(1n, buyer1.address, 1n);

      await nft.connect(ops).issueCertificate(buyer2.address);

      expect(await nft.ownerOf(1)).to.equal(buyer1.address);
      expect(await nft.ownerOf(2)).to.equal(buyer2.address);
      expect(await nft.totalIssued()).to.equal(2n);
      expect(await nft.remainingSupply()).to.equal(9_998n);
      expect(await nft.nextTokenId()).to.equal(3n);
    });

    it("blocks anyone without MINTER_ROLE — including the Safe and the deployer", async function () {
      await expect(nft.connect(stranger).issueCertificate(stranger.address)).to.be.reverted;
      await expect(nft.connect(safe).issueCertificate(buyer1.address)).to.be.reverted;
    });

    it("issues a batch to one wallet and a batch across many wallets", async function () {
      await nft.connect(ops).issueCertificateBatch(safe.address, 3);
      expect(await nft.balanceOf(safe.address)).to.equal(3n);

      await nft.connect(ops).issueCertificates([buyer1.address, buyer2.address, buyer1.address]);
      expect(await nft.ownerOf(4)).to.equal(buyer1.address);
      expect(await nft.ownerOf(5)).to.equal(buyer2.address);
      expect(await nft.ownerOf(6)).to.equal(buyer1.address);
      expect(await nft.totalIssued()).to.equal(6n);
    });

    it("rejects empty batches and the zero address", async function () {
      await expect(nft.connect(ops).issueCertificateBatch(safe.address, 0))
        .to.be.revertedWithCustomError(nft, "EmptyBatch");
      await expect(nft.connect(ops).issueCertificates([]))
        .to.be.revertedWithCustomError(nft, "EmptyBatch");
      await expect(nft.connect(ops).issueCertificate(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(nft, "ZeroAddress");
    });

    it("cannot exceed 10,000 certificates, and burns never free up a serial", async function () {
      // Slow by design: actually fills the collection to prove the cap holds.
      // 100 per tx ≈ 11.8M gas, the batch size the ops console uses.
      this.timeout(900_000);
      for (let i = 0; i < 100; i++) {
        await nft.connect(ops).issueCertificateBatch(safe.address, 100);
      }
      expect(await nft.totalIssued()).to.equal(10_000n);
      expect(await nft.remainingSupply()).to.equal(0n);

      await expect(nft.connect(ops).issueCertificate(buyer1.address))
        .to.be.revertedWithCustomError(nft, "MaxSupplyReached");

      // Burning frees a slot in totalSupply() but NOT in the serial counter.
      await nft.connect(safe).burn(1);
      expect(await nft.totalSupply()).to.equal(9_999n);
      expect(await nft.totalIssued()).to.equal(10_000n);
      await expect(nft.connect(ops).issueCertificate(buyer1.address))
        .to.be.revertedWithCustomError(nft, "MaxSupplyReached");
    });
  });

  describe("round mapping (Issuance Plan §13.2)", function () {
    it("maps serial ranges to rounds 1–4", async function () {
      const cases = [
        [1n, 1n], [1_000n, 1n],
        [1_001n, 2n], [4_000n, 2n],
        [4_001n, 3n], [7_000n, 3n],
        [7_001n, 4n], [10_000n, 4n],
      ];
      for (const [id, round] of cases) {
        expect(await nft.roundOf(id)).to.equal(round);
      }
      // Out of range → 0 (not a valid certificate).
      expect(await nft.roundOf(0n)).to.equal(0n);
      expect(await nft.roundOf(10_001n)).to.equal(0n);
    });
  });

  describe("metadata", function () {
    beforeEach(async function () {
      await nft.connect(ops).issueCertificate(buyer1.address);
    });

    it("derives tokenURI from the IPFS base URI", async function () {
      expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
      expect(await nft.baseURI()).to.equal(BASE_URI);
    });

    it("reverts tokenURI for a certificate that does not exist", async function () {
      await expect(nft.tokenURI(2)).to.be.revertedWithCustomError(nft, "NonexistentCertificate");
    });

    it("lets the Safe repoint the CID, and nobody else", async function () {
      await expect(nft.connect(safe).setBaseURI("ipfs://newCID/"))
        .to.emit(nft, "BaseURIUpdated")
        .withArgs("ipfs://newCID/");
      expect(await nft.tokenURI(1)).to.equal("ipfs://newCID/1.json");

      await expect(nft.connect(ops).setBaseURI("ipfs://evil/")).to.be.reverted;
      await expect(nft.connect(stranger).setBaseURI("ipfs://evil/")).to.be.reverted;
    });

    it("freezes the metadata permanently", async function () {
      await expect(nft.connect(safe).freezeMetadata()).to.emit(nft, "MetadataFrozen");
      expect(await nft.metadataFrozen()).to.equal(true);
      await expect(nft.connect(safe).setBaseURI("ipfs://newCID/"))
        .to.be.revertedWithCustomError(nft, "MetadataIsFrozen");
    });

    it("lets the Safe update the collection URI", async function () {
      await expect(nft.connect(safe).setContractURI("ipfs://cid/new-collection.json"))
        .to.emit(nft, "ContractURIUpdated");
      expect(await nft.contractURI()).to.equal("ipfs://cid/new-collection.json");
      await expect(nft.connect(ops).setContractURI("ipfs://evil.json")).to.be.reverted;
    });
  });

  describe("royalties (EIP-2981)", function () {
    it("returns 5% of the sale price to the Foundation treasury", async function () {
      await nft.connect(ops).issueCertificate(buyer1.address);
      const salePrice = ethers.parseEther("10");
      const [receiver, amount] = await nft.royaltyInfo(1, salePrice);
      expect(receiver).to.equal(safe.address);
      expect(amount).to.equal((salePrice * ROYALTY_BPS) / 10_000n);
    });

    it("lets the Safe change the royalty within the 10% cap", async function () {
      await nft.connect(safe).setDefaultRoyalty(buyer2.address, 750);
      const [receiver, amount] = await nft.royaltyInfo(1, 10_000n);
      expect(receiver).to.equal(buyer2.address);
      expect(amount).to.equal(750n);

      await expect(nft.connect(safe).setDefaultRoyalty(buyer2.address, 1_001))
        .to.be.revertedWithCustomError(nft, "RoyaltyTooHigh");
      await expect(nft.connect(safe).setDefaultRoyalty(ethers.ZeroAddress, 500))
        .to.be.revertedWithCustomError(nft, "ZeroAddress");
      await expect(nft.connect(ops).setDefaultRoyalty(ops.address, 1_000)).to.be.reverted;
    });

    it("advertises the ERC-721, Enumerable, 2981 and AccessControl interfaces", async function () {
      const ids = {
        ERC721: "0x80ac58cd",
        ERC721Metadata: "0x5b5e139f",
        ERC721Enumerable: "0x780e9d63",
        ERC2981: "0x2a55205a",
        AccessControl: "0x7965db0b",
      };
      for (const [label, id] of Object.entries(ids)) {
        expect(await nft.supportsInterface(id), label).to.equal(true);
      }
    });
  });

  describe("transfers, burning and pausing", function () {
    beforeEach(async function () {
      await nft.connect(ops).issueCertificates([buyer1.address, buyer2.address]);
    });

    it("is freely transferable on marketplaces", async function () {
      await nft.connect(buyer1).transferFrom(buyer1.address, stranger.address, 1);
      expect(await nft.ownerOf(1)).to.equal(stranger.address);
    });

    it("lets only the holder (or an approved operator) burn", async function () {
      await expect(nft.connect(stranger).burn(1)).to.be.reverted;
      await nft.connect(buyer1).burn(1);
      expect(await nft.exists(1)).to.equal(false);
      expect(await nft.totalSupply()).to.equal(1n);
    });

    it("halts issuance and transfers while paused", async function () {
      await nft.connect(safe).pause();
      await expect(nft.connect(ops).issueCertificate(buyer1.address)).to.be.reverted;
      await expect(nft.connect(buyer1).transferFrom(buyer1.address, stranger.address, 1)).to.be
        .reverted;

      await nft.connect(safe).unpause();
      await nft.connect(buyer1).transferFrom(buyer1.address, stranger.address, 1);
      expect(await nft.ownerOf(1)).to.equal(stranger.address);
    });

    it("only lets PAUSER_ROLE pause", async function () {
      await expect(nft.connect(ops).pause()).to.be.reverted;
      await expect(nft.connect(stranger).pause()).to.be.reverted;
    });
  });

  describe("token gating helpers", function () {
    it("reports every certificate a wallet holds", async function () {
      await nft.connect(ops).issueCertificates([buyer1.address, buyer2.address, buyer1.address]);
      expect(await nft.balanceOf(buyer1.address)).to.equal(2n);
      const owned = await nft.certificatesOf(buyer1.address);
      expect(owned.map(Number)).to.deep.equal([1, 3]);
      expect((await nft.certificatesOf(stranger.address)).length).to.equal(0);
    });
  });

  describe("issuing an exact serial (physical certificate matching)", function () {
    it("issues any un-issued serial out of order", async function () {
      await expect(nft.connect(ops).issueSpecific(buyer1.address, 888))
        .to.emit(nft, "CertificateIssued")
        .withArgs(888n, buyer1.address, 1n);
      expect(await nft.ownerOf(888)).to.equal(buyer1.address);
      expect(await nft.totalIssued()).to.equal(1n);
      expect(await nft.highestIssuedSerial()).to.equal(888n);
      // Sequential issuance is unaffected and still starts at 1.
      expect(await nft.nextTokenId()).to.equal(1n);
    });

    it("never issues the same serial twice, and skips it when going sequential", async function () {
      await nft.connect(ops).issueSpecific(buyer1.address, 2);
      await expect(nft.connect(ops).issueSpecific(buyer2.address, 2))
        .to.be.revertedWithCustomError(nft, "SerialAlreadyIssued");

      await nft.connect(ops).issueCertificate(buyer2.address); // -> 1
      expect(await nft.ownerOf(1)).to.equal(buyer2.address);
      // 2 is taken, so the cursor jumps to 3.
      expect(await nft.nextTokenId()).to.equal(3n);
      await nft.connect(ops).issueCertificate(buyer2.address);
      expect(await nft.ownerOf(3)).to.equal(buyer2.address);
    });

    it("does not let a burned serial be re-issued", async function () {
      await nft.connect(ops).issueSpecific(buyer1.address, 42);
      await nft.connect(buyer1).burn(42);
      expect(await nft.exists(42)).to.equal(false);
      expect(await nft.serialIssued(42)).to.equal(true);
      await expect(nft.connect(ops).issueSpecific(buyer2.address, 42))
        .to.be.revertedWithCustomError(nft, "SerialAlreadyIssued");
    });

    it("rejects serials outside 1 to maxSupply", async function () {
      await expect(nft.connect(ops).issueSpecific(buyer1.address, 0))
        .to.be.revertedWithCustomError(nft, "InvalidSerial");
      await expect(nft.connect(ops).issueSpecific(buyer1.address, 10_001))
        .to.be.revertedWithCustomError(nft, "InvalidSerial");
    });

    it("issues exact serials to exact recipients pairwise", async function () {
      await nft.connect(ops).issueSpecificBatch([buyer1.address, buyer2.address], [500, 9_000]);
      expect(await nft.ownerOf(500)).to.equal(buyer1.address);
      expect(await nft.ownerOf(9_000)).to.equal(buyer2.address);
      await expect(
        nft.connect(ops).issueSpecificBatch([buyer1.address], [1, 2])
      ).to.be.revertedWithCustomError(nft, "LengthMismatch");
    });

    it("stays minter-only", async function () {
      await expect(nft.connect(safe).issueSpecific(safe.address, 5)).to.be.reverted;
      await expect(nft.connect(stranger).issueSpecific(stranger.address, 5)).to.be.reverted;
    });
  });

  describe("editable collection parameters", function () {
    it("renames the collection", async function () {
      await expect(nft.connect(safe).setNameAndSymbol("Block Label Certificate v2", "BLC"))
        .to.emit(nft, "CollectionIdentityUpdated")
        .withArgs("Block Label Certificate v2", "BLC");
      expect(await nft.name()).to.equal("Block Label Certificate v2");
      expect(await nft.symbol()).to.equal("BLC");

      await expect(nft.connect(safe).setNameAndSymbol("", "X")).to.be.revertedWithCustomError(
        nft,
        "EmptyIdentity"
      );
      await expect(nft.connect(ops).setNameAndSymbol("hijack", "HIJ")).to.be.reverted;
    });

    it("reformats certificate serial numbers", async function () {
      expect(await nft.serialOf(7)).to.equal("BLDAO-000007");
      await expect(nft.connect(safe).setSerialFormat("BLC#", 4))
        .to.emit(nft, "SerialFormatUpdated")
        .withArgs("BLC#", 4);
      expect(await nft.serialOf(7)).to.equal("BLC#0007");
      expect(await nft.serialOf(123_456)).to.equal("BLC#123456"); // longer than padding

      await expect(nft.connect(safe).setSerialFormat("X", 0)).to.be.revertedWithCustomError(
        nft,
        "InvalidSerialFormat"
      );
      await expect(nft.connect(ops).setSerialFormat("X", 4)).to.be.reverted;
    });

    it("replaces the issuance rounds and their BDL allocations", async function () {
      expect(await nft.roundCount()).to.equal(4n);
      expect(await nft.bdlAirdropOf(1)).to.equal(200_000n);

      await expect(
        nft.connect(safe).setRounds([
          { from: 1, to: 500, bdlAirdrop: 300_000 },
          { from: 501, to: 10_000, bdlAirdrop: 90_000 },
        ])
      )
        .to.emit(nft, "RoundsUpdated")
        .withArgs(2n);

      expect(await nft.roundCount()).to.equal(2n);
      expect(await nft.roundOf(1)).to.equal(1n);
      expect(await nft.bdlAirdropOf(1)).to.equal(300_000n);
      expect(await nft.roundOf(501)).to.equal(2n);
      expect(await nft.bdlAirdropOf(501)).to.equal(90_000n);

      const rounds = await nft.getRounds();
      expect(rounds.length).to.equal(2);
      expect(rounds[0].bdlAirdrop).to.equal(300_000n);
    });

    it("rejects overlapping, descending or out-of-range rounds", async function () {
      await expect(
        nft.connect(safe).setRounds([
          { from: 1, to: 500, bdlAirdrop: 1 },
          { from: 400, to: 900, bdlAirdrop: 1 }, // overlaps
        ])
      ).to.be.revertedWithCustomError(nft, "InvalidRounds");

      await expect(
        nft.connect(safe).setRounds([{ from: 900, to: 500, bdlAirdrop: 1 }]) // from > to
      ).to.be.revertedWithCustomError(nft, "InvalidRounds");

      await expect(
        nft.connect(safe).setRounds([{ from: 1, to: 10_001, bdlAirdrop: 1 }]) // past cap
      ).to.be.revertedWithCustomError(nft, "InvalidRounds");

      await expect(nft.connect(ops).setRounds([{ from: 1, to: 10, bdlAirdrop: 1 }])).to.be.reverted;
    });

    it("allows serials no round covers", async function () {
      await nft.connect(safe).setRounds([{ from: 1, to: 100, bdlAirdrop: 5_000 }]);
      expect(await nft.roundOf(101)).to.equal(0n);
      expect(await nft.bdlAirdropOf(101)).to.equal(0n);
      await nft.connect(ops).issueSpecific(buyer1.address, 101);
      expect(await nft.ownerOf(101)).to.equal(buyer1.address);
    });

    it("lowers the supply cap but never raises it", async function () {
      await nft.connect(ops).issueCertificateBatch(safe.address, 5);

      await expect(nft.connect(safe).reduceMaxSupply(6_000))
        .to.emit(nft, "MaxSupplyReduced")
        .withArgs(10_000n, 6_000n);
      expect(await nft.maxSupply()).to.equal(6_000n);
      expect(await nft.remainingSupply()).to.equal(5_995n);

      // Never upward - not even back to the original.
      await expect(nft.connect(safe).reduceMaxSupply(10_000)).to.be.revertedWithCustomError(
        nft,
        "SupplyCannotIncrease"
      );
      await expect(nft.connect(safe).reduceMaxSupply(6_000)).to.be.revertedWithCustomError(
        nft,
        "SupplyCannotIncrease"
      );
      // Never below what has already been issued.
      await expect(nft.connect(safe).reduceMaxSupply(4)).to.be.revertedWithCustomError(
        nft,
        "SupplyBelowIssued"
      );
      await expect(nft.connect(ops).reduceMaxSupply(100)).to.be.reverted;
    });

    it("enforces the lowered cap on further issuance", async function () {
      await nft.connect(ops).issueCertificateBatch(safe.address, 3);
      await nft.connect(safe).reduceMaxSupply(3);
      await expect(nft.connect(ops).issueCertificate(buyer1.address))
        .to.be.revertedWithCustomError(nft, "MaxSupplyReached");
    });

    it("adjusts the royalty ceiling within the absolute limit", async function () {
      await expect(nft.connect(safe).setDefaultRoyalty(safe.address, 1_500))
        .to.be.revertedWithCustomError(nft, "RoyaltyTooHigh");

      await expect(nft.connect(safe).setMaxRoyaltyBps(2_000))
        .to.emit(nft, "MaxRoyaltyBpsUpdated")
        .withArgs(2_000n);
      await nft.connect(safe).setDefaultRoyalty(safe.address, 1_500);
      const [, amount] = await nft.royaltyInfo(1, 10_000n);
      expect(amount).to.equal(1_500n);

      // The absolute rail still holds.
      await expect(nft.connect(safe).setMaxRoyaltyBps(2_501)).to.be.revertedWithCustomError(
        nft,
        "RoyaltyTooHigh"
      );
      await expect(nft.connect(ops).setMaxRoyaltyBps(2_000)).to.be.reverted;
    });

    it("overrides the royalty for a single certificate", async function () {
      await nft.connect(ops).issueCertificate(buyer1.address);
      await nft.connect(safe).setTokenRoyalty(1, buyer2.address, 250);
      const [receiver, amount] = await nft.royaltyInfo(1, 10_000n);
      expect(receiver).to.equal(buyer2.address);
      expect(amount).to.equal(250n);
      await expect(nft.connect(ops).setTokenRoyalty(1, ops.address, 100)).to.be.reverted;
    });
  });

  describe("role rotation", function () {
    it("lets the Safe rotate a compromised operations wallet", async function () {
      const MINTER = await nft.MINTER_ROLE();
      await nft.connect(safe).revokeRole(MINTER, ops.address);
      await expect(nft.connect(ops).issueCertificate(buyer1.address)).to.be.reverted;

      await nft.connect(safe).grantRole(MINTER, stranger.address);
      await nft.connect(stranger).issueCertificate(buyer1.address);
      expect(await nft.ownerOf(1)).to.equal(buyer1.address);
    });

    it("does not let the ops wallet grant itself more power", async function () {
      const ADMIN = await nft.DEFAULT_ADMIN_ROLE();
      await expect(nft.connect(ops).grantRole(ADMIN, ops.address)).to.be.reverted;
      await expect(nft.connect(ops).grantRole(await nft.MINTER_ROLE(), stranger.address)).to.be
        .reverted;
    });
  });
});
