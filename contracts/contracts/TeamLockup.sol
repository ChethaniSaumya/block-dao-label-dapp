// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20Burnable is IERC20 {
    function burn(uint256 amount) external;
}

/**
 * @title TeamLockup — Block DAO Label (BDL) Team Vault
 *
 * @notice Locks 100% of the team allocation at launch and burns it PRO-RATA on a
 *         TOTAL-SUPPLY basis as the ecosystem burns BDL, so the team shares the
 *         same deflationary pressure as holders. When cumulative burn reaches 50%
 *         of total supply, the remaining team allocation unlocks and is claimed
 *         individually by pre-registered beneficiaries (Pull pattern).
 *
 * @dev Aligned to the BDL Whitepaper 1.0 §5 (Team Vault & Burn-linked Release) and
 *      the Token Issuance Plan v2.5. Key formulae:
 *
 *        Total supply         : 10,000,000,000 BDL   (fixed benchmark)
 *        Team allocation       :  1,000,000,000 BDL   (10%, locked here)
 *        Burn milestone        :  5,000,000,000 BDL   (50% of total supply)
 *
 *        teamBurnTarget = teamAllocation * cumulativeVerifiedBurned / TOTAL_SUPPLY
 *                         (capped at teamAllocation / 2)
 *
 *      "When 1% of total supply is burned, the team's allocation is burned 1%."
 *      At 5B cumulative burn → 500M team burned, remaining 500M unlocks for claim.
 *
 *      Whitepaper decision alignment (was previously non-team 9B base; now total
 *      supply 10B base per Whitepaper §5.1 "Tamper-proof Fixed Benchmark").
 *
 *      Verified burn is read trustlessly from the official burn address balance
 *      (buyback-and-burn sends BDL there); team burns use burn() (supply
 *      reduction) so they never inflate that balance — no double counting. An
 *      oracle path covers burns that reduce totalSupply instead.
 */
contract TeamLockup is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant BURN_ORACLE_ROLE = keccak256("BURN_ORACLE_ROLE");

    // ─────────────────────────── Immutable config ───────────────────────────

    IERC20Burnable public immutable token;
    uint256 public immutable teamAllocation; // 1,000,000,000 * 1e18
    uint256 public immutable totalSupplyBase; // 10,000,000,000 * 1e18 (benchmark)
    uint256 public immutable burnMilestone; // totalSupplyBase / 2 (5B)

    // ───────────────────────────── Mutable state ────────────────────────────

    address public officialBurnAddress; // e.g. 0x…dEaD / buyback-burn sink
    uint256 public cumulativeVerifiedBurned; // monotonic, capped at totalSupplyBase
    uint256 public teamAllocationBurned; // capped at teamAllocation / 2
    bool public bonusPoolUnlocked; // true once milestone reached
    uint256 public unlockedPoolSnapshot; // team BDL remaining at unlock (for pro-rata claims)

    // ── Beneficiary registry (immutable once finalized) ──
    struct Beneficiary {
        uint256 allocation; // relative weight (e.g. share in BDL terms)
        bool claimed;
    }
    mapping(address => Beneficiary) public beneficiaries;
    address[] public beneficiaryList;
    uint256 public totalRegisteredAllocation;
    bool public beneficiariesFinalized;

    // ───────────────────────────────── Events ───────────────────────────────

    event VerifiedBurnSynced(uint256 cumulativeVerifiedBurned, address indexed by);
    event TeamTokensBurned(uint256 amount, uint256 totalTeamBurned);
    event MilestoneReached(uint256 cumulativeVerifiedBurned, uint256 unlockedPool);
    event BeneficiaryRegistered(address indexed account, uint256 allocation);
    event BeneficiariesFinalized(uint256 count, uint256 totalAllocation);
    event BeneficiaryClaimed(address indexed account, uint256 amount);
    event OfficialBurnAddressUpdated(address indexed newAddress);

    constructor(
        address token_,
        address officialBurnAddress_,
        uint256 teamAllocation_,
        uint256 totalSupplyBase_,
        address admin_
    ) {
        require(token_ != address(0), "token=0");
        require(admin_ != address(0), "admin=0");
        require(teamAllocation_ > 0, "teamAllocation=0");
        require(totalSupplyBase_ >= teamAllocation_ * 2, "base too small");

        token = IERC20Burnable(token_);
        officialBurnAddress = officialBurnAddress_;
        teamAllocation = teamAllocation_;
        totalSupplyBase = totalSupplyBase_;
        burnMilestone = totalSupplyBase_ / 2;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(BURN_ORACLE_ROLE, admin_);
    }

    // ─────────────────────────── Burn progress sync ─────────────────────────

    /// @notice Non-team burned as observed from the official burn address balance.
    function observedNonTeamBurned() public view returns (uint256) {
        if (officialBurnAddress == address(0)) return 0;
        return token.balanceOf(officialBurnAddress);
    }

    /// @notice Sync from the on-chain burn address and apply the pro-rata team burn.
    ///         Callable by anyone (trustless / keeper-friendly).
    function syncBurnFromAddress() external nonReentrant {
        _applyVerifiedBurn(observedNonTeamBurned());
    }

    /// @notice Report cumulative verified burn when it cannot be read on-chain
    ///         (e.g. the official burn reduces totalSupply). Monotonic.
    function reportVerifiedBurn(uint256 cumulativeAmount)
        external
        onlyRole(BURN_ORACLE_ROLE)
        nonReentrant
    {
        require(cumulativeAmount >= cumulativeVerifiedBurned, "must not decrease");
        _applyVerifiedBurn(cumulativeAmount);
    }

    function _applyVerifiedBurn(uint256 observed) internal {
        if (observed > totalSupplyBase) observed = totalSupplyBase;
        if (observed > cumulativeVerifiedBurned) {
            cumulativeVerifiedBurned = observed;
            emit VerifiedBurnSynced(observed, msg.sender);
        }
        _syncTeamBurn();
    }

    /// @dev Burns team tokens up to the total-supply-based target (capped at 50%)
    ///      and unlocks the beneficiary pool once the milestone is reached.
    function _syncTeamBurn() internal {
        uint256 maxBurn = teamAllocation / 2;
        uint256 target = (teamAllocation * cumulativeVerifiedBurned) / totalSupplyBase;
        if (target > maxBurn) target = maxBurn;

        if (target > teamAllocationBurned) {
            uint256 toBurn = target - teamAllocationBurned;
            uint256 bal = token.balanceOf(address(this));
            if (toBurn > bal) toBurn = bal;
            if (toBurn > 0) {
                teamAllocationBurned += toBurn;
                token.burn(toBurn);
                emit TeamTokensBurned(toBurn, teamAllocationBurned);
            }
        }

        if (!bonusPoolUnlocked && cumulativeVerifiedBurned >= burnMilestone) {
            bonusPoolUnlocked = true;
            unlockedPoolSnapshot = token.balanceOf(address(this));
            emit MilestoneReached(cumulativeVerifiedBurned, unlockedPoolSnapshot);
        }
    }

    // ──────────────────────── Beneficiary registration ──────────────────────

    /// @notice Register a team beneficiary and their allocation weight. Only before
    ///         finalization; immutable thereafter (Whitepaper §5.4).
    function registerBeneficiary(address account, uint256 allocation)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(!beneficiariesFinalized, "finalized");
        require(account != address(0), "account=0");
        require(allocation > 0, "allocation=0");
        require(beneficiaries[account].allocation == 0, "already registered");
        require(totalRegisteredAllocation + allocation <= teamAllocation, "exceeds team alloc");

        beneficiaries[account] = Beneficiary({allocation: allocation, claimed: false});
        beneficiaryList.push(account);
        totalRegisteredAllocation += allocation;
        emit BeneficiaryRegistered(account, allocation);
    }

    /// @notice Lock the beneficiary registry permanently.
    function finalizeBeneficiaries() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!beneficiariesFinalized, "already finalized");
        require(totalRegisteredAllocation > 0, "no beneficiaries");
        beneficiariesFinalized = true;
        emit BeneficiariesFinalized(beneficiaryList.length, totalRegisteredAllocation);
    }

    /// @notice A beneficiary pulls their pro-rata share of the unlocked pool.
    ///         entitlement = unlockedPoolSnapshot * allocation / totalRegisteredAllocation.
    function claim() external nonReentrant {
        require(bonusPoolUnlocked, "locked: milestone not reached");
        require(beneficiariesFinalized, "beneficiaries not finalized");
        Beneficiary storage b = beneficiaries[msg.sender];
        require(b.allocation > 0, "not a beneficiary");
        require(!b.claimed, "already claimed");

        uint256 amount = (unlockedPoolSnapshot * b.allocation) / totalRegisteredAllocation;
        b.claimed = true;
        uint256 bal = token.balanceOf(address(this));
        if (amount > bal) amount = bal; // dust safety on final claim
        require(amount > 0, "nothing to claim");
        IERC20(address(token)).safeTransfer(msg.sender, amount);
        emit BeneficiaryClaimed(msg.sender, amount);
    }

    function claimableOf(address account) external view returns (uint256) {
        if (!bonusPoolUnlocked || !beneficiariesFinalized) return 0;
        Beneficiary storage b = beneficiaries[account];
        if (b.allocation == 0 || b.claimed) return 0;
        return (unlockedPoolSnapshot * b.allocation) / totalRegisteredAllocation;
    }

    // ──────────────────────────────── Views ─────────────────────────────────

    function remainingLockedTeam() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function milestoneReached() public view returns (bool) {
        return cumulativeVerifiedBurned >= burnMilestone;
    }

    /// @notice Burn progress against total supply, in basis points (0–10000).
    function burnProgressBps() external view returns (uint256) {
        return (cumulativeVerifiedBurned * 10_000) / totalSupplyBase;
    }

    function beneficiaryCount() external view returns (uint256) {
        return beneficiaryList.length;
    }

    // ──────────────────────────────── Admin ─────────────────────────────────

    function setOfficialBurnAddress(address a) external onlyRole(DEFAULT_ADMIN_ROLE) {
        officialBurnAddress = a;
        emit OfficialBurnAddressUpdated(a);
    }
}
