// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC721/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ProtoCards0 is ERC721, Ownable {

  IERC721Enumerable public xmonNFT;

  // min and max indices, inclusive
  uint256 public min;
  uint256 public max;

  // xmon fee
  IERC20 public xmon;
  uint256 public xmonFee;

  constructor() ERC721("ProtoCards0", "PROTO") public {
    min = 5;
    max = 132;
    xmon = IERC20(0x3aaDA3e213aBf8529606924d8D1c55CbDc70Bf74);
    xmonNFT = IERC721Enumerable(0x0427743DF720801825a5c82e0582B1E915E0F750);
    xmonFee = 0.1 ether;
  }

  function batchMint(uint256[] calldata ids) external {
    for (uint256 i = 0; i < ids.length; i++) {
      mintCard(ids[i]);
    }
  }

  // mints a card NFT if the owner has the corresponding xmon NFT
  function mintCard(uint256 id) public {
    require(xmonNFT.ownerOf(id) == msg.sender, "Not owner");
    require(id <= max, "Too high");
    require(id >= min, "Too low");
    xmon.transferFrom(msg.sender, address(this), xmonFee);
    _mint(msg.sender, id);
  }

  // Modifies the tokenURI of a monster
  function setTokenURI(uint256 id, string memory uri) public onlyOwner {
    _setTokenURI(id, uri);
  }

  // Sets the base URI
  function setBaseURI(string memory uri) public onlyOwner {
    _setBaseURI(uri);
  }

  function setXmon(address a) public onlyOwner {
    xmon = IERC20(a);
  }

  function setXmonFee(uint256 f) public onlyOwner {
    xmonFee = f;
  }

  function setXmonNFT(address a) public onlyOwner {
    xmonNFT = IERC721Enumerable(a);
  }

  // Rescues tokens locked in the contract
  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyOwner {
    IERC20 _token = IERC20(tokenAddress);
    _token.transfer(to, numTokens);
  }
}