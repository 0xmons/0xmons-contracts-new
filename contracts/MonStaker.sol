// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./IMonMinter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

// reseterRole which can modify the summonDelay and doom balances

contract MonStaker is AccessControl {

  modifier onlyAdmin {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
    _;
  }

  modifier onlyStakerAdmin {
    require(hasRole(STAKER_ADMIN_ROLE, msg.sender), "Not staker admin");
    _;
  }

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  bytes32 public constant STAKER_ADMIN_ROLE = keccak256("STAKER_ADMIN_ROLE");

  IERC20 public xmon;
  IMonMinter public monMinter;

  uint256 public maxMons;
  uint256 public numMons;

  uint256 public maxStake;

  struct Stake {
    uint256 amount;
    uint256 startBlock;
  }
  mapping(address => Stake) public stakeRecords;

  // amount of doom needed to summon monster
  uint256 public doomFee;

  // fee in XMON to pay to reset delay
  uint256 public resetFee;

  // starting delay
  uint256 public startDelay;

  // initial rarity
  uint256 public rarity;

  // the amount of doom accrued by each account
  mapping(address => uint256) public doomBalances;

  // the additional delay between mintings for each account
  mapping(address => uint256) public summonDelay;

  // the block at which each account can summon
  mapping(address => uint256) public nextSummonTime;

  constructor() public {

    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Make the caller admin a staker admin
    grantRole(STAKER_ADMIN_ROLE, msg.sender);

    // starting fee is 1 XMON to reset
    resetFee = 1 * (10**18);

    // starting max stake of 5 XMON
    maxStake = 5 * (10**18);

    // starting delay is 3000 blocks, ~12 hours
    startDelay = 3000;

    // starting maxMons is 256
    maxMons = 256;

    // starting rarity is 1
    rarity = 1;
  }

  function addStake(uint256 amount) public {

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

    // initialize the summonDelay if it's 0
    if (summonDelay[msg.sender] == 0) {
      summonDelay[msg.sender] = startDelay;
    }

    // transfer tokens to contract
    xmon.safeTransferFrom(msg.sender, address(this), amount);
  }

  function removeStake() public {
    // award doom
    awardDoom(msg.sender);

    // calculate how much to award
    uint256 amountToTransfer = stakeRecords[msg.sender].amount;

    // remove stake records
    delete stakeRecords[msg.sender];

    // transfer tokens back
    xmon.safeTransfer(msg.sender, amountToTransfer);
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
    require(doomBalances[msg.sender] >= doomFee, "Not enough DOOM");
    require(block.number > nextSummonTime[msg.sender], "Time isn't up yet");
    require(numMons < maxMons, "All mons are out");

    // remove doom fee from caller's doom balance
    doomBalances[msg.sender] = doomBalances[msg.sender].sub(doomFee);

    // update the next block where summon can happen
    nextSummonTime[msg.sender] = summonDelay[msg.sender] + block.number;

    // double the delay time
    summonDelay[msg.sender] = summonDelay[msg.sender].mul(2);

    // Update num mons count
    numMons = numMons.add(1);

    // mint the monster
    uint256 id = monMinter.mintMonster(
      msg.sender,
      0,
      0,
      1,
      uint256(blockhash(block.number.sub(1))),
      0,
      rarity
    );

    // return new monster id
    return(id);
  }

  function resetDelay() public {
    // set delay to the starting value
    summonDelay[msg.sender] = startDelay;

    // move tokens to the XMON contract as fee
    xmon.safeTransferFrom(msg.sender, address(xmon), resetFee);
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyAdmin {
    require(tokenAddress != address(xmon), "Can't move XMON");
    IERC20 _token = IERC20(tokenAddress);
    _token.safeTransfer(to, numTokens);
  }

  function setXMON(address tokenAddress) public onlyAdmin {
    require(address(xmon) == address(0), "already set");
    xmon = IERC20(tokenAddress);
  }

  function setMonMinter(address a) public onlyAdmin {
    require(address(monMinter) == address(0), "already set");
    monMinter = IMonMinter(a);
  }

  function setRarity(uint256 r) public onlyAdmin {
    rarity = r;
  }

  function setMaxMons(uint256 m) public onlyAdmin {
    maxMons = m;
  }

  function setMaxStake(uint256 m) public onlyAdmin {
    maxStake = m;
  }

  function setStartDelay(uint256 s) public onlyAdmin {
    startDelay = s;
  }

  function setResetFee(uint256 f) public onlyAdmin {
    resetFee = f;
  }

  function setDoomFee(uint256 f) public onlyAdmin {
    doomFee = f;
  }

  // Allows admin to add new staker admins
  function setStakerAdminRole(address a) public onlyAdmin {
    grantRole(STAKER_ADMIN_ROLE, a);
  }

  function setDoomBalances(address a, uint256 d) public onlyStakerAdmin {
    doomBalances[a] = d;
  }

  function setSummonDelay(address a, uint256 d) public onlyStakerAdmin {
    summonDelay[a] = d;
  }

  function pendingDoom(address a) public view returns(uint256) {
    uint256 doomAmount = stakeRecords[a].amount.mul(block.number.sub(stakeRecords[a].startBlock));
    return(doomAmount);
  }
}