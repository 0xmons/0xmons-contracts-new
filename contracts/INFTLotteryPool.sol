// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface INFTLotteryPool {
  function initialize(
    address _prizeAddress,
    uint256 _prizeId,
    uint64 _startDate,
    uint64 _endDate,
    uint32 _minTicketsToSell,
    uint32 _maxTickets,
    uint32 _maxTicketsPerAddress,
    uint256 _ticketPrice
  ) external;

  function transferOwnership(address newOwner) external;
}