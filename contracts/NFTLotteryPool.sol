// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./IDistributor.sol";
import "./ILotteryReference.sol";
import "./ITokenURI.sol";

contract NFTLotteryPool is ERC721Upgradeable, OwnableUpgradeable, ERC721Holder, ReentrancyGuard {

  using SafeERC20 for IERC20;

  ILotteryReference private REFERENCE;
  IDistributor private RNG_DISTRIBUTOR;
  IERC20 private LINK;

  // Lottery vars
  address public prizeAddress;
  uint256 public prizeId;
  uint64 public startDate;
  uint64 public endDate;
  uint32 public minTicketsToSell;
  uint32 public maxTickets;
  uint32 public maxTicketsPerAddress;
  uint256 public ticketPrice;

  // Mutex for calling VRF
  bool public hasCalledVRF;

  // Check if refunds are allowed
  bool public isRefundOpen;

  function initialize(
    address _prizeAddress,
    uint256 _prizeId,
    uint64 _startDate,
    uint64 _endDate,
    uint32 _minTicketsToSell,
    uint32 _maxTickets,
    uint32 _maxTicketsPerAddress,
    uint256 _ticketPrice
  ) external initializer {
    require(_endDate > _startDate, "End is before start");
    require(_minTicketsToSell > 0, "Min sell at least 1");
    require(_minTicketsToSell <= _maxTickets, "Min greater than max");
    require(_maxTicketsPerAddress >= 1, "Must be able to buy at least 1");
    __Ownable_init();
    __ERC721_init("NFT-LOTTERY", "LOTTO");
    REFERENCE = ILotteryReference(msg.sender);
    LINK = IERC20(REFERENCE.LINK_ADDRESS());
    RNG_DISTRIBUTOR = IDistributor(REFERENCE.RNG_DISTRIBUTOR_ADDRESS());
    prizeAddress = _prizeAddress;
    prizeId = _prizeId;
    startDate = _startDate;
    endDate = _endDate;
    minTicketsToSell = _minTicketsToSell;
    maxTickets = _maxTickets;
    maxTicketsPerAddress = _maxTicketsPerAddress;
    ticketPrice = _ticketPrice;
    // NOTE: Prize and LINK are moved into the contract via the pool factory
  }

  function buyTickets(uint256 numTickets) public payable {
    require(block.timestamp >= startDate, "Too early");
    require(balanceOf(msg.sender).add(numTickets) <= maxTicketsPerAddress, "Holding too many");
    require(totalSupply().add(numTickets) <= maxTickets, "Exceeds max supply");
    require(msg.value == ticketPrice.mul(numTickets), "Price incorrect");
    require(block.timestamp < endDate, "Lottery over");
    for (uint256 i = 0; i < numTickets; i++) {
      _mint(msg.sender, totalSupply()+1);
    }
  }

  function unlockRefund() public {
    require(block.timestamp > endDate + 7 days, "Too early");
    require(!hasCalledVRF, "Already VRFed");
    isRefundOpen = true;
  }

  function getRefund(uint256[] calldata ids) external nonReentrant {
    require(block.timestamp > endDate, "Lottery not over");
    require(totalSupply() < minTicketsToSell || isRefundOpen, "Enough tickets sold");
    uint256 refundAmount = 0;
    for (uint256 i = 0; i < ids.length; i++) {
      require(ownerOf(ids[i]) == msg.sender, "Not owner");
      _burn(ids[i]);
      refundAmount = refundAmount.add(ticketPrice);
    }
    (bool sent, bytes memory data) = msg.sender.call{value: refundAmount}("");
    require(sent, "Transfer failed");
  }

  function refundOwnerAssets() public onlyOwner {
    require(block.timestamp > endDate, "Lottery not over");
    require(totalSupply() < minTicketsToSell || isRefundOpen, "Enough tickets sold");
    LINK.safeTransfer(owner(), REFERENCE.LINK_FEE());
    IERC721Enumerable(prizeAddress).safeTransferFrom(address(this), owner(), prizeId);
  }

  function distributePrize() public onlyOwner {
    require(totalSupply() >= minTicketsToSell, "Not enough tickets sold");
    require(block.timestamp > endDate, "Lottery not over");
    require(! hasCalledVRF, "Already called VRF");
    LINK.approve(address(RNG_DISTRIBUTOR), REFERENCE.LINK_FEE());
    IERC721Enumerable(prizeAddress).setApprovalForAll(address(RNG_DISTRIBUTOR), true);
    RNG_DISTRIBUTOR.distributeToNftHolders(REFERENCE.LINK_FEE(), address(this), 1, totalSupply(), prizeAddress, prizeId);
    hasCalledVRF = true;
  }

  function claimETH() public onlyOwner {
    require(hasCalledVRF, "Must call VRF first");
    require(IERC721Enumerable(prizeAddress).ownerOf(prizeId) != address(RNG_DISTRIBUTOR), "No VRF yet");
    owner().call{value: address(this).balance}("");
  }

  function tokenURI(uint256 id) public view override returns (string memory) {
    return ITokenURI(REFERENCE.masterTokenURI()).tokenURI(id);
  }
}