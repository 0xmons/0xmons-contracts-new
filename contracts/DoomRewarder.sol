// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./IDoomAdmin.sol";

contract DoomRewarder is Ownable {

  using SafeMath for uint256;

  // reference to IDoomAdmin instance
  IDoomAdmin public doomAdmin;

  struct Bounty {
    bytes32 passwordHash;
    uint256 maxClaimers;
    uint256 doomAmount;
  }
  mapping(uint256 => Bounty) public bountyInfo;

  // current bounty id
  uint256 public currentBountyId;

  mapping(uint256 => mapping(address => bool)) public hasClaimed;
  mapping(uint256 => uint256) public numClaimers;
  mapping(uint256 => bool) public isInvalid;

  constructor(address a) public {
    doomAdmin = IDoomAdmin(a);
  }

  function addBounty(bytes32 passwordHash, uint256 doomAmount, uint256 maxClaimers) public onlyOwner {
    // Update bounty ID
    currentBountyId = currentBountyId.add(1);
    // Add new bounty to mapping
    bountyInfo[currentBountyId] = Bounty(passwordHash, maxClaimers, doomAmount);
  }

  function claimBounty(uint256 bountyID, string memory password) public {
    require(! isInvalid[bountyID], "now invalid");
    require(!hasClaimed[bountyID][msg.sender], "already claimed");
    Bounty memory currBounty = bountyInfo[bountyID];
    require(numClaimers[bountyID] < currBounty.maxClaimers, "already out");
    bytes32 attemptedHash = keccak256(abi.encodePacked(password));
    if (attemptedHash == currBounty.passwordHash) {

      // Set account to be true
      hasClaimed[bountyID][msg.sender] = true;

      // Update number of bounty claimers
      numClaimers[bountyID] = numClaimers[bountyID].add(1);

      // Add DOOM to account
      _addDoom(currBounty.doomAmount);
    }
  }

  function _addDoom(uint256 amount) private {
    uint256 newBalance = doomAdmin.doomBalances(msg.sender).add(amount);
    doomAdmin.setDoomBalances(msg.sender, newBalance);
  }

  function setBountyInvalidity(uint256 id, bool b) public onlyOwner {
    isInvalid[id] = b;
  }

  function setIDoomAdmin(address a) public onlyOwner {
    doomAdmin = IDoomAdmin(a);
  }

  function yeet() public onlyOwner {
    selfdestruct(0x75d4bdBf6593ed463e9625694272a0FF9a6D346F);
  }
}