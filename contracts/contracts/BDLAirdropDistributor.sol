// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/structs/BitMaps.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BDLAirdropDistributor — Merkle, pull-based BDL airdrop (multi-round)
 *
 * @notice Distributes pre-funded BDL to verified recipients via a Merkle claim
 *         pattern (Whitepaper §4.4). Only a 32-byte Merkle root per round is
 *         stored on-chain; recipients submit a proof and call {claim}. The token
 *         contract itself has no airdrop logic (separation of concerns) — this
 *         contract holds BDL transferred in and releases it only to valid claims.
 *
 * @dev Eligibility (corporate DAO link + BDL 540-day staking + round/serial
 *      tiers) is computed OFF-CHAIN by the operations backend, which builds the
 *      round's Merkle tree and publishes the leaf list (IPFS/GitHub) for public
 *      verification. Root setting is intended to be behind a multisig + timelock.
 *
 *      Leaf = keccak256(abi.encodePacked(index, account, amount)).
 *      OpenZeppelin {MerkleProof} uses commutative (sorted-pair) hashing.
 */
contract BDLAirdropDistributor is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using BitMaps for BitMaps.BitMap;

    /// @notice May set/replace round Merkle roots (multisig + timelock in prod).
    bytes32 public constant ROOT_MANAGER_ROLE = keccak256("ROOT_MANAGER_ROLE");

    IERC20 public immutable token; // BDL

    mapping(uint256 => bytes32) public roots; // round => merkle root
    mapping(uint256 => BitMaps.BitMap) private _claimed; // round => claimed bitmap

    event RootUpdated(uint256 indexed round, bytes32 root);
    event Claimed(uint256 indexed round, uint256 index, address indexed account, uint256 amount);
    event Swept(address indexed to, uint256 amount);

    constructor(address token_, address admin_) {
        require(token_ != address(0) && admin_ != address(0), "zero addr");
        token = IERC20(token_);
        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(ROOT_MANAGER_ROLE, admin_);
    }

    /// @notice Set (or replace, e.g. on list correction) the Merkle root for a round.
    function setRoot(uint256 round, bytes32 root) external onlyRole(ROOT_MANAGER_ROLE) {
        roots[round] = root;
        emit RootUpdated(round, root);
    }

    function isClaimed(uint256 round, uint256 index) public view returns (bool) {
        return _claimed[round].get(index);
    }

    /// @notice Claim a round allocation with a Merkle proof (anyone can submit for
    ///         `account`; funds always go to `account`).
    function claim(
        uint256 round,
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata proof
    ) external nonReentrant {
        bytes32 root = roots[round];
        require(root != bytes32(0), "round not open");
        require(!isClaimed(round, index), "already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(index, account, amount));
        require(MerkleProof.verify(proof, root, leaf), "invalid proof");

        _claimed[round].set(index);
        token.safeTransfer(account, amount);
        emit Claimed(round, index, account, amount);
    }

    /// @notice Recover unclaimed / leftover BDL (e.g. after a round closes).
    function sweep(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(to != address(0), "to=0");
        token.safeTransfer(to, amount);
        emit Swept(to, amount);
    }
}
