// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./MonCreatorInstance.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// reseterRole which can modify the summonDelay and doom balances

contract MonStaker is MonCreatorInstance {

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

  // amount of doom needed to summon monster
  uint256 public doomFee;

  // fee in XMON to pay to reset delay
  uint256 public resetFee;

  // starting delay
  uint256 public startDelay;

  // initial rarity
  uint256 public rarity;

  // maximum delay between summons
  uint256 public maxDelay;

  // the amount of doom accrued by each account
  mapping(address => uint256) public doomBalances;

  // the additional delay between mintings for each account
  mapping(address => uint256) public summonDelay;

  // the block at which each account can summon
  mapping(address => uint256) public nextSummonTime;

  modifier onlyStakerAdmin {
    require(hasRole(STAKER_ADMIN_ROLE, msg.sender), "Not staker admin");
    _;
  }

  constructor(address xmonAddress, address monMinterAddress) public {

    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Make the caller admin a staker admin
    grantRole(STAKER_ADMIN_ROLE, msg.sender);

    // starting reset fee is 1 XMON to reset
    resetFee = 1 * (10**18);

    // starting delay is 6000 blocks, ~22 hours (assuming 6500 blocks a day)
    startDelay = 6000;

    // max delay is 48,000 blocks, ~8 days
    maxDelay = 48000;

    // starting rarity is 1
    rarity = 1;

    // set xmon instance
    xmon = IERC20(xmonAddress);

    // set monMinter instance
    monMinter = IMonMinter(monMinterAddress);
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

    // calculate how much XMON to transfer back
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
    require(doomBalances[msg.sender] >= doomFee, "Not enough DOOM");
    require(block.number >= nextSummonTime[msg.sender], "Time isn't up yet");
    super.updateNumMons();

    // remove doom fee from caller's doom balance
    doomBalances[msg.sender] = doomBalances[msg.sender].sub(doomFee);

    // update the next block where summon can happen
    nextSummonTime[msg.sender] = summonDelay[msg.sender] + block.number;

    // double the delay time
    summonDelay[msg.sender] = summonDelay[msg.sender].mul(2);

    // set it to be maxDelay if that's lower
    if (summonDelay[msg.sender] > maxDelay) {
      summonDelay[msg.sender] = maxDelay;
    }

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

    // return new monster id
    return(id);
  }

  function resetDelay() public {
    // set delay to the starting value
    summonDelay[msg.sender] = startDelay;

    // move tokens to the XMON contract as fee
    xmon.safeTransferFrom(msg.sender, address(xmon), resetFee);
  }

  function setRarity(uint256 r) public onlyAdmin {
    rarity = r;
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

  function setMaxDelay(uint256 d) public onlyAdmin {
    require(maxDelay >= startDelay, "maxDelay too low");
    maxDelay = d;
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

  function setSummonDelay(address a, uint256 d) public onlyStakerAdmin {
    summonDelay[a] = d;
  }

  function setNextSummonTime(address a, uint256 t) public onlyStakerAdmin {
    nextSummonTime[a] = t;
  }

  function pendingDoom(address a) public view returns(uint256) {
    uint256 doomAmount = stakeRecords[a].amount.mul(block.number.sub(stakeRecords[a].startBlock));
    return(doomAmount);
  }
}