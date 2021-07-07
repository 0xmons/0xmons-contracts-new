// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFGasNames {

  uint256 public test1;
  bytes32 public test2;

  mapping(uint256 => string) public names;
  IERC721 public nfgas;

  constructor(address a) public {
    nfgas = IERC721(a);
  }

  function setName(uint256 id, string memory name) public {
    require(nfgas.ownerOf(id) == msg.sender, "Not owner");
    uint256 hashValue = uint(keccak256(abi.encodePacked(name))) % 1025;
    require(hashValue == id, "hashValue incorrect");
    names[id] = name;
  }
}