// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISVGGenerator.sol";

contract NFGas is Ownable, ERC721Burnable {

  address payable public feeRecipient = 0x75d4bdBf6593ed463e9625694272a0FF9a6D346F;
  uint256 public feeAmount = 0.1 ether;
  uint256 public averageGasPrice;
  ISVGGenerator public generator;
  uint256[] public purchasedIds;
  event Purchased(uint256 id);

  // TODO:
  // metadata address (creates the SVG) [x]
  // metadata function that doesn't use URI [ ]
  // SVG creator contract [x]
  // set token URIs [ ]

  constructor(address a) ERC721("Non-Fungible Gas", "NFG") public {
    _mint(msg.sender, 0);
    generator = ISVGGenerator(a);
    averageGasPrice = 1;
  }

  modifier exactGas(uint256 id) {
    require(tx.gasprice == (id*(10**9)), "Exact gas");
    _;
  }

  modifier updateAverageGasPrice() {
    averageGasPrice = (tx.gasprice + averageGasPrice)/2;
    _;
  }

  function mint(uint256 id) public payable exactGas(id) updateAverageGasPrice() {
    require(id <= 1024, "Too high");
    require(msg.value == feeAmount, "Pay fee");
    purchasedIds.push(id);
    feeRecipient.transfer(msg.value);
    _mint(msg.sender, id);
    emit Purchased(id);
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 id
    ) public override exactGas(id) updateAverageGasPrice() {
    super.safeTransferFrom(from, to, id);
  }

  function transferFrom(
    address from,
    address to,
    uint256 id
    ) public override exactGas(id) updateAverageGasPrice() {
    super.transferFrom(from, to, id);
  }

  function svg(uint256 id) public returns (string memory) {
    return generator.createSVG(id, averageGasPrice);
  }

  function setFeeRecipient(address payable a) public onlyOwner {
    feeRecipient = a;
  }

  function setGenerator(address a) public onlyOwner {
    generator = ISVGGenerator(a);
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyOwner {
    IERC20 _token = IERC20(tokenAddress);
    _token.transfer(to, numTokens);
  }

  // Modifies the tokenURI of a monster
  function setTokenURI(uint256 id, string memory uri) public onlyOwner {
    _setTokenURI(id, uri);
  }

  // Sets the base URI
  function setBaseURI(string memory uri) public onlyOwner {
    _setBaseURI(uri);
  }
}
