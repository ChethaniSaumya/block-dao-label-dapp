// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title BlockLabelToken (BDL) — Block DAO Label, BEP-20 Utility & Governance Token
 * @notice Native currency and governance token of the Block DAO Label ecosystem
 *         on BNB Chain. Distribution is community-first (Fan DAO + Creator DAO)
 *         and airdrop/claim based — no token sale.
 * @dev Built on OpenZeppelin v5. Per the BDL whitepaper and CertiK Skynet
 *      "Tokenomics / Centralization Risk" criteria, the token is intentionally
 *      MINIMAL: Fixed Supply + Burnable + Emergency Pause, and has NO mint
 *      function (immutable supply, zero inflation risk). All supplementary logic
 *      (airdrop distribution, team lock-up / pro-rata burn) is isolated in
 *      separate contracts (e.g. {TeamLockup}) to shrink the audit surface.
 *
 *      Total supply is fixed at deployment (10,000,000,000 BDL) and minted once
 *      to the deployer, which then distributes to the 7 allocation multisig
 *      wallets. Ownership / PAUSER_ROLE are intended to be held by a 3-of-5
 *      multisig, with a 48–72h timelock on pause/config changes.
 */
contract BlockLabelToken is ERC20, ERC20Burnable, ERC20Pausable, Ownable, AccessControl {
    /// @notice Role identifier for addresses allowed to pause/unpause transfers.
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /**
     * @param name_         Token name (e.g. "Block DAO Label").
     * @param symbol_       Token symbol (e.g. "BDL").
     * @param initialSupply Fixed total supply in WHOLE tokens (e.g. 10000000000);
     *                      decimals applied internally. Minted once, never again.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        // Fixed supply: minted once at deployment. No mint function exists.
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    /// @notice Pauses all token transfers (emergency use). Requires PAUSER_ROLE.
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Resumes token transfers after a pause. Requires PAUSER_ROLE.
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @dev Required override: ERC20 + ERC20Pausable both implement _update.
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }

    /// @dev Required override: ERC20 + AccessControl both implement supportsInterface.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl)
        returns (bool)
    {
        return
            interfaceId == type(IERC20).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
