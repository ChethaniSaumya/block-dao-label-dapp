// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BlockLabelCertificateNFT — Block Label Creator DAO Certificate (BEP-721)
 *
 * @notice The 10,000-unit Creator DAO Certificate collection issued by the Block
 *         Label Foundation on BNB Smart Chain (NFT Certificate Issuance Plan
 *         §12.3). Certificates are sold off-chain (card / PG payment); once a
 *         payment is confirmed, the operations wallet issues a certificate
 *         directly to the buyer's BSC wallet.
 *
 * @dev DESIGN: configurable, but not upgradeable.
 *
 *      Every business parameter the Foundation may want to revise later is
 *      live-editable by the admin multisig — collection name and symbol, the
 *      metadata CID, the collection URI, the issuance rounds and their BDL
 *      allocations, the certificate serial format, the royalty and its own
 *      ceiling, and the minting authority. Issuance works either sequentially
 *      ("next available") or at an exact serial, so a buyer can be matched to a
 *      specific physical certificate number.
 *
 *      Two guarantees are deliberately NOT editable, because they are what the
 *      buyer is paying for:
 *        1. {maxSupply} can be lowered but never raised — the "limited to
 *           10,000, no additional issuance" promise cannot be walked back.
 *        2. A serial number is issued at most once, ever. Burning a certificate
 *           does not free its number for re-issuance.
 *
 *      There is no upgrade proxy: future ecosystem features (staking, tier
 *      logic, token gating, the BDL claim contract) are separate contracts that
 *      read {ownerOf} / {balanceOf} from this one, so none of them require
 *      changing the certificate registry itself.
 *
 *      Authority split (Issuance Plan §12.3 "Minting Authority"):
 *        - DEFAULT_ADMIN_ROLE + owner()  -> Foundation Safe multisig. All
 *          configuration.
 *        - MINTER_ROLE                   -> hot "operations" wallet. Issuance
 *          only. A compromise of that key cannot change any setting, and cannot
 *          issue past {maxSupply}.
 */
contract BlockLabelCertificateNFT is
    ERC721,
    ERC721Enumerable,
    ERC721Burnable,
    ERC721Pausable,
    ERC2981,
    AccessControl,
    Ownable
{
    using Strings for uint256;
    using BitMaps for BitMaps.BitMap;

    /// @notice May issue certificates. Held by the operations wallet.
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @notice May pause/unpause transfers and issuance (emergency use).
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @notice Hard ceiling on the adjustable royalty cap (25%). Marketplaces
    ///         ignore anything above ~10% in practice; this is a sanity rail.
    uint96 public constant ABSOLUTE_MAX_ROYALTY_BPS = 2_500;

    /// @notice An issuance round: serials [from, to] each carrying `bdlAirdrop`
    ///         whole BDL. Editable by the admin (Issuance Plan §13.1).
    struct Round {
        uint32 from;
        uint32 to;
        uint96 bdlAirdrop;
    }

    // ── Editable collection parameters ──────────────────────────────────────

    /// @notice Supply cap. Adjustable DOWNWARD only, never up.
    uint256 public maxSupply;

    /// @notice Ceiling applied to {setDefaultRoyalty}, itself adjustable up to
    ///         {ABSOLUTE_MAX_ROYALTY_BPS}.
    uint96 public maxRoyaltyBps;

    /// @notice Certificate serial prefix, e.g. "BLDAO-".
    string public serialPrefix;

    /// @notice Digits the serial number is zero-padded to, e.g. 6 -> "000001".
    uint8 public serialPadding;

    /// @notice Collection-level metadata URI read by NFT marketplaces.
    string public contractURI;

    /// @notice Once true, {setBaseURI} is permanently disabled. Optional — the
    ///         Foundation freezes only when the metadata CID is final.
    bool public metadataFrozen;

    // ── Internal state ──────────────────────────────────────────────────────

    string private _collectionName;
    string private _collectionSymbol;

    /// @dev `ipfs://<metadata CID>/` — tokenURI appends `<tokenId>.json`.
    string private _baseTokenURI;

    Round[] private _rounds;

    /// @dev Serials issued at least once. Never cleared, so a burned serial is
    ///      not re-issuable.
    BitMaps.BitMap private _issuedSerials;

    /// @dev Search cursor for the next sequential serial. Only ever moves up.
    uint256 private _cursor = 1;

    uint256 private _issuedCount;
    uint256 private _highestIssued;

    // ── Events ──────────────────────────────────────────────────────────────

    /// @param tokenId Certificate serial number issued.
    /// @param to      Buyer wallet the certificate was delivered to.
    /// @param round   Issuance round the serial falls in (0 if uncovered).
    event CertificateIssued(uint256 indexed tokenId, address indexed to, uint256 indexed round);
    event BaseURIUpdated(string baseURI);
    event ContractURIUpdated(string contractURI);
    event MetadataFrozen();
    event CollectionIdentityUpdated(string name, string symbol);
    event SerialFormatUpdated(string prefix, uint8 padding);
    event RoundsUpdated(uint256 count);
    event MaxSupplyReduced(uint256 previousMax, uint256 newMax);
    event MaxRoyaltyBpsUpdated(uint96 maxRoyaltyBps);

    // ── Errors ──────────────────────────────────────────────────────────────

    error MaxSupplyReached();
    error MetadataIsFrozen();
    error RoyaltyTooHigh();
    error ZeroAddress();
    error EmptyBatch();
    error LengthMismatch();
    error NonexistentCertificate();
    error InvalidSerial();
    error SerialAlreadyIssued();
    error SupplyCannotIncrease();
    error SupplyBelowIssued();
    error InvalidRounds();
    error InvalidSerialFormat();
    error EmptyIdentity();

    /**
     * @param name_            Collection name, e.g. "Block Label Creator DAO Certificate".
     * @param symbol_          Collection symbol, e.g. "BLDAO".
     * @param admin_           Foundation Safe multisig — owner + DEFAULT_ADMIN_ROLE + PAUSER_ROLE.
     * @param minter_          Operations wallet — MINTER_ROLE only.
     * @param baseURI_         `ipfs://<metadata CID>/`.
     * @param contractURI_     Collection metadata URI (may be empty at deploy time).
     * @param royaltyReceiver_ EIP-2981 royalty recipient (Foundation treasury Safe).
     * @param royaltyBps_      EIP-2981 royalty in basis points (500 = 5%).
     * @param maxSupply_       Supply cap (10000 per the issuance plan).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address admin_,
        address minter_,
        string memory baseURI_,
        string memory contractURI_,
        address royaltyReceiver_,
        uint96 royaltyBps_,
        uint256 maxSupply_
    ) ERC721(name_, symbol_) Ownable(admin_) {
        if (admin_ == address(0) || minter_ == address(0) || royaltyReceiver_ == address(0)) {
            revert ZeroAddress();
        }
        if (maxSupply_ == 0) revert InvalidSerial();
        if (bytes(name_).length == 0 || bytes(symbol_).length == 0) revert EmptyIdentity();

        maxRoyaltyBps = 1_000; // 10% default ceiling
        if (royaltyBps_ > maxRoyaltyBps) revert RoyaltyTooHigh();

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(PAUSER_ROLE, admin_);
        _grantRole(MINTER_ROLE, minter_);

        _collectionName = name_;
        _collectionSymbol = symbol_;
        _baseTokenURI = baseURI_;
        contractURI = contractURI_;
        maxSupply = maxSupply_;
        serialPrefix = "BLDAO-";
        serialPadding = 6;
        _setDefaultRoyalty(royaltyReceiver_, royaltyBps_);

        // Default rounds — Issuance Plan §13.1. Fully replaceable via {setRounds}.
        _rounds.push(Round({from: 1, to: 1_000, bdlAirdrop: 200_000}));
        _rounds.push(Round({from: 1_001, to: 4_000, bdlAirdrop: 150_000}));
        _rounds.push(Round({from: 4_001, to: 7_000, bdlAirdrop: 120_000}));
        _rounds.push(Round({from: 7_001, to: 10_000, bdlAirdrop: 100_000}));
    }

    // ─────────────────────────────── Issuance ───────────────────────────────

    /**
     * @notice Issue the next available certificate to a confirmed buyer.
     * @dev Called by the operations wallet after card / PG payment settles.
     * @return tokenId The certificate serial number that was issued.
     */
    function issueCertificate(address to) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        tokenId = _issueNext(to);
    }

    /**
     * @notice Issue a specific certificate serial to a buyer.
     * @dev Use when the buyer must receive the number printed on their physical
     *      certificate. Any serial not yet issued is valid.
     */
    function issueSpecific(address to, uint256 tokenId) external onlyRole(MINTER_ROLE) {
        _issue(to, tokenId);
    }

    /// @notice Issue the next `quantity` available certificates to one wallet.
    function issueCertificateBatch(address to, uint256 quantity)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 firstTokenId, uint256 lastTokenId)
    {
        if (quantity == 0) revert EmptyBatch();
        for (uint256 i = 0; i < quantity; ++i) {
            lastTokenId = _issueNext(to);
            if (i == 0) firstTokenId = lastTokenId;
        }
    }

    /// @notice Issue one next-available certificate to each address, in order.
    function issueCertificates(address[] calldata recipients)
        external
        onlyRole(MINTER_ROLE)
        returns (uint256 firstTokenId, uint256 lastTokenId)
    {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyBatch();
        for (uint256 i = 0; i < len; ++i) {
            lastTokenId = _issueNext(recipients[i]);
            if (i == 0) firstTokenId = lastTokenId;
        }
    }

    /// @notice Issue exact serials to exact recipients, pairwise.
    function issueSpecificBatch(address[] calldata recipients, uint256[] calldata tokenIds)
        external
        onlyRole(MINTER_ROLE)
    {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyBatch();
        if (len != tokenIds.length) revert LengthMismatch();
        for (uint256 i = 0; i < len; ++i) {
            _issue(recipients[i], tokenIds[i]);
        }
    }

    function _issueNext(address to) private returns (uint256 tokenId) {
        tokenId = nextTokenId();
        if (tokenId == 0) revert MaxSupplyReached();
        _cursor = tokenId + 1;
        _issue(to, tokenId);
    }

    function _issue(address to, uint256 tokenId) private {
        if (to == address(0)) revert ZeroAddress();
        if (tokenId == 0 || tokenId > maxSupply) revert InvalidSerial();
        if (_issuedSerials.get(tokenId)) revert SerialAlreadyIssued();

        _issuedSerials.set(tokenId);
        unchecked {
            ++_issuedCount;
        }
        if (tokenId > _highestIssued) _highestIssued = tokenId;

        // safeMint: rejects contract recipients that cannot custody ERC-721s.
        _safeMint(to, tokenId);
        emit CertificateIssued(tokenId, to, roundOf(tokenId));
    }

    // ──────────────────────────────── Views ─────────────────────────────────

    function name() public view override returns (string memory) {
        return _collectionName;
    }

    function symbol() public view override returns (string memory) {
        return _collectionSymbol;
    }

    /// @notice Certificates issued so far (burns do NOT free up serial numbers).
    function totalIssued() public view returns (uint256) {
        return _issuedCount;
    }

    /// @notice Certificates still available for issuance.
    function remainingSupply() public view returns (uint256) {
        return maxSupply - _issuedCount;
    }

    /// @notice Highest serial number issued so far — the floor for {reduceMaxSupply}.
    function highestIssuedSerial() public view returns (uint256) {
        return _highestIssued;
    }

    /// @notice The serial the next sequential issuance will use, or 0 if none left.
    function nextTokenId() public view returns (uint256) {
        uint256 id = _cursor;
        uint256 cap = maxSupply;
        while (id <= cap && _issuedSerials.get(id)) {
            unchecked {
                ++id;
            }
        }
        return id <= cap ? id : 0;
    }

    /// @notice True once a serial has been issued — stays true after a burn.
    function serialIssued(uint256 tokenId) public view returns (bool) {
        return _issuedSerials.get(tokenId);
    }

    /// @notice The configured issuance rounds.
    function getRounds() external view returns (Round[] memory) {
        return _rounds;
    }

    function roundCount() external view returns (uint256) {
        return _rounds.length;
    }

    /// @notice 1-based issuance round for a serial, or 0 if no round covers it.
    function roundOf(uint256 tokenId) public view returns (uint256) {
        uint256 len = _rounds.length;
        for (uint256 i = 0; i < len; ++i) {
            if (tokenId >= _rounds[i].from && tokenId <= _rounds[i].to) return i + 1;
        }
        return 0;
    }

    /// @notice Whole BDL allocated to a serial by its round (0 if uncovered).
    function bdlAirdropOf(uint256 tokenId) public view returns (uint256) {
        uint256 r = roundOf(tokenId);
        return r == 0 ? 0 : _rounds[r - 1].bdlAirdrop;
    }

    /// @notice Formatted certificate number, e.g. 7 -> "BLDAO-000007".
    function serialOf(uint256 tokenId) public view returns (string memory) {
        string memory digits = tokenId.toString();
        uint256 len = bytes(digits).length;
        if (len >= serialPadding) return string.concat(serialPrefix, digits);

        bytes memory zeros = new bytes(serialPadding - len);
        for (uint256 i = 0; i < zeros.length; ++i) {
            zeros[i] = "0";
        }
        return string.concat(serialPrefix, string(zeros), digits);
    }

    /// @notice True if the certificate exists right now (false once burned).
    function exists(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /// @notice All certificate serials currently held by `owner`.
    /// @dev View-only convenience for the dApp's token-gating UI; unbounded
    ///      loop, never call on-chain from another contract.
    function certificatesOf(address owner) external view returns (uint256[] memory tokenIds) {
        uint256 count = balanceOf(owner);
        tokenIds = new uint256[](count);
        for (uint256 i = 0; i < count; ++i) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!exists(tokenId)) revert NonexistentCertificate();
        return string.concat(_baseTokenURI, tokenId.toString(), ".json");
    }

    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    // ──────────────────────────── Administration ────────────────────────────

    /// @notice Rename the collection as shown on explorers and marketplaces.
    function setNameAndSymbol(string calldata newName, string calldata newSymbol)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (bytes(newName).length == 0 || bytes(newSymbol).length == 0) revert EmptyIdentity();
        _collectionName = newName;
        _collectionSymbol = newSymbol;
        emit CollectionIdentityUpdated(newName, newSymbol);
    }

    /// @notice Repoint metadata to a new IPFS CID. Disabled after {freezeMetadata}.
    function setBaseURI(string calldata newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (metadataFrozen) revert MetadataIsFrozen();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /// @notice Permanently lock the metadata URI. One-way; cannot be undone.
    function freezeMetadata() external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadataFrozen = true;
        emit MetadataFrozen();
    }

    /// @notice Update the collection-level metadata URI shown by marketplaces.
    function setContractURI(string calldata newContractURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = newContractURI;
        emit ContractURIUpdated(newContractURI);
    }

    /// @notice Change how certificate numbers are rendered, e.g. ("BLDAO-", 6).
    function setSerialFormat(string calldata prefix, uint8 padding)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (padding == 0 || padding > 32) revert InvalidSerialFormat();
        serialPrefix = prefix;
        serialPadding = padding;
        emit SerialFormatUpdated(prefix, padding);
    }

    /**
     * @notice Replace the issuance rounds and their BDL allocations.
     * @dev Rounds must be ascending, non-overlapping and inside [1, maxSupply].
     *      They need not cover every serial — an uncovered serial simply has
     *      round 0 and no allocation. Already-issued certificates keep their
     *      serial; their round/allocation follows the new table.
     */
    function setRounds(Round[] calldata newRounds) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 len = newRounds.length;
        uint256 previousTo;
        for (uint256 i = 0; i < len; ++i) {
            Round calldata r = newRounds[i];
            if (r.from == 0 || r.from > r.to || r.to > maxSupply) revert InvalidRounds();
            if (r.from <= previousTo) revert InvalidRounds();
            previousTo = r.to;
        }

        delete _rounds;
        for (uint256 i = 0; i < len; ++i) {
            _rounds.push(newRounds[i]);
        }
        emit RoundsUpdated(len);
    }

    /**
     * @notice Lower the supply cap. Cannot be raised — the scarcity promise made
     *         to certificate buyers is one-directional by design.
     * @dev Useful to close the collection early at, say, 6,000 units.
     */
    function reduceMaxSupply(uint256 newMaxSupply) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newMaxSupply >= maxSupply) revert SupplyCannotIncrease();
        if (newMaxSupply < _highestIssued) revert SupplyBelowIssued();
        uint256 previous = maxSupply;
        maxSupply = newMaxSupply;
        emit MaxSupplyReduced(previous, newMaxSupply);
    }

    /// @notice Adjust the ceiling that {setDefaultRoyalty} is checked against.
    function setMaxRoyaltyBps(uint96 newMaxRoyaltyBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newMaxRoyaltyBps > ABSOLUTE_MAX_ROYALTY_BPS) revert RoyaltyTooHigh();
        maxRoyaltyBps = newMaxRoyaltyBps;
        emit MaxRoyaltyBpsUpdated(newMaxRoyaltyBps);
    }

    /// @notice Update the EIP-2981 royalty (capped by {maxRoyaltyBps}).
    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (receiver == address(0)) revert ZeroAddress();
        if (feeNumerator > maxRoyaltyBps) revert RoyaltyTooHigh();
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /// @notice Override the royalty for one certificate (rarely needed).
    function setTokenRoyalty(uint256 tokenId, address receiver, uint96 feeNumerator)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (receiver == address(0)) revert ZeroAddress();
        if (feeNumerator > maxRoyaltyBps) revert RoyaltyTooHigh();
        _setTokenRoyalty(tokenId, receiver, feeNumerator);
    }

    /// @notice Halt all issuance and transfers (emergency use).
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resume issuance and transfers.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ─────────────────────── Required multiple-inheritance ──────────────────

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
