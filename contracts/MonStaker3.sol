// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./MonCreatorInstance.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IDoomAdmin.sol";

contract MonStaker3 is MonCreatorInstance {

  using SafeMath for uint256;
  using Strings for uint256;
  using SafeERC20 for IERC20;

  bytes32 public constant STAKER_ADMIN_ROLE = keccak256("STAKER_ADMIN_ROLE");

  // Offset for the URI
  int128 public uriOffset;

  // Start time for mintMon
  uint256 public claimMonStart;

  // Maximum amount of DOOM to migrate
  uint256 public maxDoomToMigrate;

  // Last migration date
  uint256 public lastMigrationDate;

  // Record of which addresses have migrated
  mapping(address => bool) public hasMigrated;

  // Previous staker reference
  IDoomAdmin public prevStaker;

  struct Stake {
    uint256 amount;
    uint256 startBlock;
  }
  mapping(address => Stake) public stakeRecords;

  // amount of base doom needed to summon monster
  uint256 public baseDoomFee;

  // the amount of doom accrued by each account
  mapping(address => uint256) public doomBalances;

  // initial rarity
  uint256 public rarity;

  modifier onlyStakerAdmin {
    require(hasRole(STAKER_ADMIN_ROLE, msg.sender), "Not staker admin");
    _;
  }

  constructor(address xmonAddress, address monMinterAddress) public {
    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // Make the caller admin a staker admin
    grantRole(STAKER_ADMIN_ROLE, msg.sender);

    // starting rarity is 2
    rarity = 2;

    // set xmon instance
    xmon = IERC20(xmonAddress);

    // set monMinter instance
    monMinter = IMonMinter(monMinterAddress);

    // set max DOOM to migrate to be 666 times doom scaling
    maxDoomToMigrate = 666 * (10**21);

    // set new doom fee to be sqrt(12 ether)*6600*10 = approx 23.76*(10**13) = 2376*(10**11)
    baseDoomFee = 2376 * (10**11);

    // set prefixURI
    prefixURI = "mons2/";

    // Point to previous staker
    prevStaker = IDoomAdmin(0xD06337A401B468657dE2f9d3E390cE5b21C3c1C0);

    // Set first time to claim and last migration date to be 2021, April 2, 10 am pacific time
    claimMonStart = 1617382800;
    lastMigrationDate = 1617382800;
  }

  // Taken from Uniswap
  function sqrt(uint y) public pure returns (uint z) {
    if (y > 3) {
        z = y;
        uint x = y / 2 + 1;
        while (x < z) {
            z = x;
            x = (y / x + x) / 2;
        }
    } else if (y != 0) {
        z = 1;
    }
  }

  function addStake(uint256 amount) public {
    require(amount > 0, "Need to stake nonzero");

    // award existing doom
    awardDoom(msg.sender);

    // update to total amount
    uint256 newAmount = stakeRecords[msg.sender].amount.add(amount);

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
      // DOOM = sqrt(staked balance) * number of blocks staked
      uint256 doomAmount = sqrt(stakeRecords[a].amount).mul(block.number.sub(stakeRecords[a].startBlock));
      doomBalances[a] = doomBalances[a].add(doomAmount);

      // reset the start block
      stakeRecords[a].startBlock = block.number;
    }
  }

  // Claim a monster
  function claimMon() public returns (uint256) {
    require(block.timestamp >= claimMonStart, "Not time yet");

    // award doom first
    awardDoom(msg.sender);

    // check conditions
    require(doomBalances[msg.sender] >= baseDoomFee, "Not enough DOOM");
    super.updateNumMons();

    // remove doom fee from caller's doom balance
    doomBalances[msg.sender] = doomBalances[msg.sender].sub(baseDoomFee);

    // update the offset of the new mon to be the prefix plus the numMons
    // if uriOffset is negative, it will subtract from numMons
    // otherwise, it adds to numMons
    uint256 offsetMons = uriOffset < 0 ? numMons - uint256(uriOffset) : numMons + uint256(uriOffset);

    // mint the monster
    uint256 id = monMinter.mintMonster(
      // to
      msg.sender,
      // parent1Id
      0,
      // parent2Id
      0,
      // minterContract (we don't actually care where it came from for now)
      address(0),
      // contractOrder (also set to be the offset)
      offsetMons,
      // gen
      1,
      // bits
      0,
      // exp
      0,
      // rarity
      rarity
    );
    string memory uri = string(abi.encodePacked(prefixURI, offsetMons.toString()));
    monMinter.setTokenURI(id, uri);

    // return new monster id
    return(id);
  }

  function migrateDoom() public {
    require(!hasMigrated[msg.sender], "Already migrated");
    require(block.timestamp <= lastMigrationDate, "Time limit up");
    uint256 totalDoom = prevStaker.pendingDoom(msg.sender) + prevStaker.doomBalances(msg.sender);
    if (totalDoom > maxDoomToMigrate) {
      totalDoom = maxDoomToMigrate;
    }
    totalDoom = (totalDoom*baseDoomFee)/maxDoomToMigrate;
    doomBalances[msg.sender] = totalDoom;
    hasMigrated[msg.sender] = true;
  }

  function setUriOffset(int128 o) public onlyAdmin {
    uriOffset = o;
  }

  function setLastMigrationDate(uint256 d) public onlyAdmin {
    lastMigrationDate = d;
  }

  function setMaxDoomToMigrate(uint256 m) public onlyAdmin {
    maxDoomToMigrate = m;
  }

  function setClaimMonStart(uint256 c) public onlyAdmin {
    claimMonStart = c;
  }

  function setRarity(uint256 r) public onlyAdmin {
    rarity = r;
  }

  function setBaseDoomFee(uint256 f) public onlyAdmin {
    baseDoomFee = f;
  }

  function setMonMinter(address a) public onlyAdmin {
    monMinter = IMonMinter(a);
  }

  function setPrevStaker(address a) public onlyAdmin {
    prevStaker = IDoomAdmin(a);
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

  function balanceOf(address a) public view returns(uint256) {
    return stakeRecords[a].amount;
  }

  function pendingDoom(address a) public view returns(uint256) {
    return(sqrt(stakeRecords[a].amount).mul(block.number.sub(stakeRecords[a].startBlock)));
  }
}