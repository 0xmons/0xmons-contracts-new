// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract TestDistributor {

  address public recipient;

  function setRecipient(address a) public {
    recipient = a;
  }

  function distributeToNftHolders(
    uint256 fee,
    address _nftRecipientAddress,
    uint256 startIndex,
    uint256 endIndex,
    address _rewardAddress,
    uint256 _rewardId) external {
    IERC721(_rewardAddress).safeTransferFrom(msg.sender, recipient, _rewardId);
  }
}