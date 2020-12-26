// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./MonCreatorInstance.sol";
import "./IWhitelist.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MonStaker2 is MonCreatorInstance {

  using SafeMath for uint256;
  using Strings for uint256;
  using SafeERC20 for IERC20;

  bytes32 public constant STAKER_ADMIN_ROLE = keccak256("STAKER_ADMIN_ROLE");

  uint256 public maxStake;

  struct Stake {
    uint256 amount;
    uint256 startBlock;
  }
  mapping(address => Stake) public stakeRecords;

  // amount of time an account has summoned
  mapping(address => uint256) public numSummons;

  // the amount that gets added as a multiplier to numSummons
  // summon fee in DOOM = numSummons * extraDoom + baseDoomFee
  uint256 public doomMultiplier;

  // amount of base doom needed to summon monster
  uint256 public baseDoomFee;

  // the amount of doom accrued by each account
  mapping(address => uint256) public doomBalances;

  // initial rarity
  uint256 public rarity;

  // the reference for checking if this contract is whitelisted
  IWhitelist private whitelistChecker;

  modifier onlyStakerAdmin {
    require(hasRole(STAKER_ADMIN_ROLE, msg.sender), "Not staker admin");
    _;
  }

  constructor(address xmonAddress, address monMinterAddress) public {
    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Make the caller admin a staker admin
    grantRole(STAKER_ADMIN_ROLE, msg.sender);

    // starting rarity is 1
    rarity = 1;

    // set xmon instance
    xmon = IERC20(xmonAddress);

    // set whitelistChecker to also be the xmonAddress
    whitelistChecker = IWhitelist(xmonAddress);

    // set monMinter instance
    monMinter = IMonMinter(monMinterAddress);
  }

  function addStake(uint256 amount) public {

    require(whitelistChecker.whitelist(address(this)), "Staker not whitelisted!");
    require(amount > 0, "Need to stake nonzero");

    // award existing doom
    awardDoom(msg.sender);

    // update to total amount
    uint256 newAmount = stakeRecords[msg.sender].amount.add(amount);

    // ensure the total is less than max stake
    require(newAmount <= maxStake, "Exceeds max stake");

    // update stake records
    stakeRecords[msg.sender] = Stake(
      newAmount,
      block.number
    );

    // transfer tokens to contract
    xmon.safeTransferFrom(msg.sender, address(this), amount);
  }

  function removeStake() public {
    // award doom
    awardDoom(msg.sender);
    emergencyRemoveStake();
  }

  function emergencyRemoveStake() public {
    // calculate how much to award
    uint256 amountToTransfer = stakeRecords[msg.sender].amount;

    // remove stake records
    delete stakeRecords[msg.sender];

    // transfer tokens back
    xmon.safeTransfer(msg.sender, amountToTransfer);
  }

  // Awards accumulated doom and resets startBlock
  function awardDoom(address a) public {
    // If there is an existing amount staked, add the current accumulated amount and reset the block number
    if (stakeRecords[a].amount != 0) {
      uint256 doomAmount = stakeRecords[a].amount.mul(block.number.sub(stakeRecords[a].startBlock));
      doomBalances[a] = doomBalances[a].add(doomAmount);

      // reset the start block
      stakeRecords[a].startBlock = block.number;
    }
  }

  // Claim a monster
  function claimMon() public returns (uint256) {

    // award doom first
    awardDoom(msg.sender);

    // check conditions
    require(doomBalances[msg.sender] >= doomFee(msg.sender), "Not enough DOOM");
    super.updateNumMons();

    // remove doom fee from caller's doom balance
    doomBalances[msg.sender] = doomBalances[msg.sender].sub(doomFee(msg.sender));

    // mint the monster
    uint256 id = monMinter.mintMonster(
      // to
      msg.sender,
      // parent1Id
      0,
      // parent2Id
      0,
      // minterContract
      address(this),
      // contractOrder
      numMons,
      // gen
      1,
      // bits
      uint256(blockhash(block.number.sub(1))),
      // exp
      0,
      // rarity
      rarity
    );

    // update the URI of the new mon to be the prefix plus the numMons
    string memory uri = string(abi.encodePacked(prefixURI, numMons.toString()));
    monMinter.setTokenURI(id, uri);

    // update the number of summons
    numSummons[msg.sender] = numSummons[msg.sender].add(1);

    // return new monster id
    return(id);
  }

  function setRarity(uint256 r) public onlyAdmin {
    rarity = r;
  }

  function setMaxStake(uint256 m) public onlyAdmin {
    maxStake = m;
  }

  function setBaseDoomFee(uint256 f) public onlyAdmin {
    baseDoomFee = f;
  }

  function setDoomMultiplier(uint256 m) public onlyAdmin {
    doomMultiplier = m;
  }

  // Allows admin to add new staker admins
  function setStakerAdminRole(address a) public onlyAdmin {
    grantRole(STAKER_ADMIN_ROLE, a);
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyAdmin {
    require(tokenAddress != address(xmon), "Can't move XMON");
    IERC20 _token = IERC20(tokenAddress);
    _token.safeTransfer(to, numTokens);
  }

  function setDoomBalances(address a, uint256 d) public onlyStakerAdmin {
    doomBalances[a] = d;
  }

  function pendingDoom(address a) public view returns(uint256) {
    uint256 doomAmount = stakeRecords[a].amount.mul(block.number.sub(stakeRecords[a].startBlock));
    return(doomAmount);
  }

  function doomFee(address a) public view returns(uint256) {
    return (numSummons[a].mul(doomMultiplier)).add(baseDoomFee);
  }

}