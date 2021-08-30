// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./IDistributor.sol";
import {ClonesUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./INFTLotteryPool.sol";

contract NFTLotteryPoolFactory is Ownable {

  using SafeERC20 for IERC20;

  address immutable public LINK_ADDRESS;
  address immutable public RNG_DISTRIBUTOR_ADDRESS;
  uint256 immutable public LINK_FEE;

  uint256 public poolFee = 0.1 ether;
  address public template;
  address public masterTokenURI;

  event LotteryDeployed(address a, address deployer);

  constructor(
    address _RNG_DISTRIBUTOR_ADDRESS, 
    address _LINK_ADDRESS, 
    uint256 _LINK_FEE, 
    address _template, 
    address _masterTokenURI
  ) public {
    LINK_ADDRESS = _LINK_ADDRESS;
    RNG_DISTRIBUTOR_ADDRESS = _RNG_DISTRIBUTOR_ADDRESS;
    LINK_FEE = _LINK_FEE;
    template = _template;
    masterTokenURI = _masterTokenURI;
  }

  function createNFTLotteryPool(
    bytes32 salt,
    address _prizeAddress,
    uint256 _prizeId,
    uint64 _startDate,
    uint64 _endDate,
    uint32 _minTicketsToSell,
    uint32 _maxTickets,
    uint32 _maxTicketsPerAddress,
    uint256 _ticketPrice
  ) external payable returns (address) {
    require(msg.value >= poolFee, "Pay fee");
    INFTLotteryPool pool = INFTLotteryPool(ClonesUpgradeable.cloneDeterministic(template, salt));
    pool.initialize(
      _prizeAddress,
      _prizeId,
      _startDate,
      _endDate,
      _minTicketsToSell,
      _maxTickets,
      _maxTicketsPerAddress,
      _ticketPrice
    );

    // Transfers ownership of pool to caller
    pool.transferOwnership(msg.sender);

    // Escrows the LINK and NFT prize
    IERC721(_prizeAddress).safeTransferFrom(msg.sender, address(pool), _prizeId);
    IERC20(LINK_ADDRESS).safeTransferFrom(msg.sender, address(pool), LINK_FEE);
    
    emit LotteryDeployed(address(pool), msg.sender);
    return address(pool);
  }

  function getLotteryAddress(bytes32 salt) public view returns (address) {
    return ClonesUpgradeable.predictDeterministicAddress(template, salt);
  }

  function updatePoolFee(uint256 f) public onlyOwner {
    poolFee = f;
  }

  function claimETH() public onlyOwner {
    owner().call{value: address(this).balance}("");
  }

  function setMasterTokenURI(address a) public onlyOwner {
    masterTokenURI = a;
  }
}