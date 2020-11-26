// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./UsesMon.sol";
import "./IMonMinter.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract MonSpawner is AccessControl, UsesMon {

  using SafeMath for uint256;

  modifier onlyAdmin {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
    _;
  }

  modifier onlySpawnerAdmin {
    require(hasRole(SPAWNER_ADMIN_ROLE, msg.sender), "Not spawner admin");
    _;
  }

  using SafeMath for uint256;
  using SafeMath for uint8;

  using SafeERC20 for IERC20;

  bytes32 public constant SPAWNER_ADMIN_ROLE = keccak256("SPAWNER_ADMIN_ROLE");

  IERC20 xmon;
  IMonMinter monMinter;

  // cost in XMON to spawn a monster
  uint256 public spawnFee;

  // initial delay between spawns
  uint256 public initialDelay;

  // extra delay incurred by later generations
  uint256 public extraDelay;

  // every pair of monsters can only spawn once
  mapping(uint256 => mapping(uint256 => bool)) hasSpawned;

  // block where a monster becomes usable for spawning again
  mapping(uint256 => uint256) monUnlock;

  // to be appended before the URI for the NFT
  string prefixURI;

  constructor() public {
    // Give caller admin permissions
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  function spawnNewMon(uint256 mon1Id, uint256 mon2Id) public returns (uint256) {
    require(monMinter.ownerOf(mon1Id) == msg.sender, "Need to own mon1");
    require(monMinter.ownerOf(mon2Id) == msg.sender, "Need to own mon2");
    require(!hasSpawned[mon1Id][mon2Id] && !hasSpawned[mon2Id][mon1Id], "Already spawned mon1 mon2");
    require(block.number >= monUnlock[mon1Id], "mon1 isn't unlocked yet");
    require(block.number >= monUnlock[mon2Id], "mon2 isn't unlocked yet");

    // set spawn to be true
    hasSpawned[mon1Id][mon2Id] = true;

    // transfer fee to token address
    xmon.transferFrom(msg.sender, address(xmon), spawnFee);

    Mon memory mon1 = monMinter.monRecords(mon1Id);
    Mon memory mon2 = monMinter.monRecords(mon2Id);

    // update the unlock time of each mon to be initalDelay + (gen*extraDelay)
    monUnlock[mon1Id] = initialDelay.add(extraDelay.mul(mon1.gen));
    monUnlock[mon2Id] = initialDelay.add(extraDelay.mul(mon2.gen));

    // Set generation to be the lower of the two parents
    uint256 gen = mon1.gen.add(1);
    if (mon2.gen < mon1.gen) {
      gen = mon2.gen.add(1);
    }

    // mint the new monster
    uint256 id = monMinter.mintMonster(
      msg.sender,
      mon1Id,
      mon2Id,
      gen,
      uint256(blockhash(block.number.sub(1))),
      0,
      // assign random rarity from 1 to 64
      uint8(uint256(blockhash(block.number.sub(1)))).div(4).add(1)
    );

    // update the URI

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

  function setPrefixURI(string memory prefix) public onlyAdmin {
    prefixURI = prefix;
  }

  function setSpawnFee(uint256 f) public onlyAdmin {
    spawnFee = f;
  }

  function setXMON(address tokenAddress) public onlyAdmin {
    require(address(xmon) == address(0), "already set");
    xmon = IERC20(tokenAddress);
  }

  function setMonMinter(address a) public onlyAdmin {
    require(address(monMinter) == address(0), "already set");
    monMinter = IMonMinter(a);
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyAdmin {
    IERC20 _token = IERC20(tokenAddress);
    _token.safeTransfer(to, numTokens);
  }

}