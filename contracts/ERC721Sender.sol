// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract ERC721Sender {

  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Mapping of ERC721 address to tokenID to ERC20 address to amounts
  mapping(address => mapping (uint256 => mapping (address => uint256))) public rewards;

  // Used to make future lookups faster
  mapping(address => bool) public isCached;
  mapping(address => IERC721Enumerable) public erc721Cache;
  mapping(address => IERC20) public erc20Cache;



  function setRewards(address[] memory erc721Addresses,
                      uint256[] memory tokenIds,
                      address erc20Address,
                      uint256[] memory amounts) public {
    uint256 totalToTransfer = 0;
    if (! isCached[erc20Address]) {
      erc20Cache[erc20Address] = IERC20(erc20Address);
      isCached[erc20Address] = true;
    }
    for (uint256 i = 0; i < erc721Addresses.length; i += 1) {
      if (! isCached[erc721Addresses[i]]) {
        erc721Cache[erc721Addresses[i]] = IERC721Enumerable(erc721Addresses[i]);
        isCached[erc721Addresses[i]] = true;
      }
      uint256 previousRewardAmount = rewards[erc721Addresses[i]][tokenIds[i]][erc20Address];
      rewards[erc721Addresses[i]][tokenIds[i]][erc20Address] = previousRewardAmount.add(amounts[i]);
      totalToTransfer = totalToTransfer.add(amounts[i]);
    }
    erc20Cache[erc20Address].safeTransferFrom(msg.sender, address(this), totalToTransfer);
  }



  function takeRewards(address erc721Address, uint256 tokenId, address erc20Address) public {
    if (! isCached[erc721Address]) {
        erc721Cache[erc721Address] = IERC721Enumerable(erc721Address);
        isCached[erc721Address] = true;
    }
    if (! isCached[erc20Address]) {
      erc20Cache[erc20Address] = IERC20(erc20Address);
      isCached[erc20Address] = true;
    }

    require(erc721Cache[erc721Address].ownerOf(tokenId) == msg.sender, "Not owner");

    uint256 rewardAmount = rewards[erc721Address][tokenId][erc20Address];
    delete rewards[erc721Address][tokenId][erc20Address];

    erc20Cache[erc20Address].safeTransfer(msg.sender, rewardAmount);
  }



  function sendRewards(address[] memory erc721Addresses,
                      uint256[] memory tokenIds,
                      address erc20Address,
                      uint256[] memory amounts) public {
    if (! isCached[erc20Address]) {
      erc20Cache[erc20Address] = IERC20(erc20Address);
      isCached[erc20Address] = true;
    }
    for (uint256 i = 0; i < erc721Addresses.length; i += 1) {
      if (! isCached[erc721Addresses[i]]) {
        erc721Cache[erc721Addresses[i]] = IERC721Enumerable(erc721Addresses[i]);
        isCached[erc721Addresses[i]] = true;
      }
      address erc721Holder = erc721Cache[erc721Addresses[i]].ownerOf(tokenIds[i]);
      erc20Cache[erc20Address].safeTransferFrom(msg.sender, erc721Holder, amounts[i]);
    }
  }

}
