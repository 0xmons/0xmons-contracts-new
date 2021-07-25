// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface IDistributor {
   function distributeToNftHolders(
     uint256 fee,
     address _nftRecipientAddress,
     uint256 startIndex,
     uint256 endIndex,
     address _rewardAddress,
     uint256 _rewardId
    ) external;
}