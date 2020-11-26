// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface UsesMon {
  struct Mon {
      address summoner;
      uint256 parent1;
      uint256 parent2;
      uint256 gen;
      uint256 bits;
      uint256 exp;
      uint256 rarity;
  }
}