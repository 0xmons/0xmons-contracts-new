// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface IDoomAdmin {
  function pendingDoom(address a) external view returns(uint256);
  function doomBalances(address a) external returns (uint256);
  function setDoomBalances(address a, uint256 d) external;
}