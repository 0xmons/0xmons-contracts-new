// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./MonCreatorInstance.sol";
import "./UsesMon.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MonSpawner is MonCreatorInstance, UsesMon {

  using SafeMath for uint256;
  using Strings for uint256;
  using SafeMath for uint8;
  using SafeERC20 for IERC20;

  modifier onlySpawnerAdmin {
    require(hasRole(SPAWNER_ADMIN_ROLE, msg.sender), "Not spawner admin");
    _;
  }

  bytes32 public constant SPAWNER_ADMIN_ROLE = keccak256("SPAWNER_ADMIN_ROLE");

  // cost in XMON to spawn a monster
  uint256 public spawnFee;

  // initial delay between spawns
  uint256 public initialDelay;

  // extra delay incurred by later generations
  uint256 public extraDelay;

  // every pair of monsters can only spawn once
  mapping(uint256 => mapping(uint256 => bool)) public hasSpawned;

  // block where a monster becomes usable for spawning again
  mapping(uint256 => uint256) public monUnlock;

  constructor(address xmonAddress, address monMinterAddress) public {

    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

    // set xmon instance
    xmon = IERC20(xmonAddress);

    // set monMinter instance
    monMinter = IMonMinter(monMinterAddress);

    // spawnFee is 0.1 XMON to start
    spawnFee = 0.1 * (10**18);
  }

  function spawnNewMon(uint256 mon1Id, uint256 mon2Id) public returns (uint256) {
    require(monMinter.ownerOf(mon1Id) == msg.sender, "Need to own mon1");
    require(monMinter.ownerOf(mon2Id) == msg.sender, "Need to own mon2");
    require(!hasSpawned[mon1Id][mon2Id], "Already spawned with mon1 mon2");
    require(block.number >= monUnlock[mon1Id], "mon1 isn't unlocked yet");
    require(block.number >= monUnlock[mon2Id], "mon2 isn't unlocked yet");
    require(mon1Id != mon2Id, "Can't spawn monster with itself");
    super.updateNumMons();

    // set spawn to be true for both (A,B) (B,A) pairings
    hasSpawned[mon1Id][mon2Id] = true;
    hasSpawned[mon2Id][mon1Id] = true;

    // transfer fee to token address
    xmon.transferFrom(msg.sender, address(xmon), spawnFee);

    // get references for both monsters
    Mon memory mon1 = monMinter.monRecords(mon1Id);
    Mon memory mon2 = monMinter.monRecords(mon2Id);

    // update the unlock time of each mon to be current block + (initalDelay + ((gen-1)*extraDelay))
    monUnlock[mon1Id] = block.number.add(initialDelay.add(extraDelay.mul(mon1.gen.sub(1))));
    monUnlock[mon2Id] = block.number.add(initialDelay.add(extraDelay.mul(mon2.gen.sub(1))));

    // Set generation to be the lower of the two parents
    uint256 gen = mon1.gen.add(1);
    if (mon2.gen < mon1.gen) {
      gen = mon2.gen.add(1);
    }

    // mint the new monster
    uint256 id = monMinter.mintMonster(
      // to
      msg.sender,
      // parent1Id
      mon1Id,
      // parent2Id
      mon2Id,
      // minterContract
      address(this),
      // contractOrder
      numMons,
      // generation
      gen,
      // bits
      uint256(blockhash(block.number.sub(1))),
      // exp
      0,
      // assign random rarity from 1 to 64
      uint8(uint256(blockhash(block.number.sub(1)))).div(4).add(1)
    );

    // update the URI of the new mon to be the prefix plus the id
    string memory uri = string(abi.encodePacked(prefixURI, numMons.toString()));
    monMinter.setTokenURI(id, uri);

    return(id);
  }

  function setMonUnlock(uint256 id, uint256 blockNum) public onlySpawnerAdmin {
    monUnlock[id] = blockNum;
  }

  function setInitialDelay(uint256 d) public onlyAdmin {
    initialDelay = d;
  }

  function setExtraDelay(uint256 d) public onlyAdmin {
    extraDelay = d;
  }

  function setSpawnFee(uint256 f) public onlyAdmin {
    spawnFee = f;
  }

  function setSpawnerAdminRole(address a) public onlyAdmin {
    grantRole(SPAWNER_ADMIN_ROLE, a);
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyAdmin {
    IERC20 _token = IERC20(tokenAddress);
    _token.safeTransfer(to, numTokens);
  }

}