// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface ILotteryReference {
  function LINK_ADDRESS() external returns(address);
  function RNG_DISTRIBUTOR_ADDRESS() external returns(address);
  function LINK_FEE() external returns(uint256);
}