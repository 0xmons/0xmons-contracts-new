// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface UsesMon {
  struct Mon {
      // the original address this monster went to
      address summoner;

      // the unique ID associated with parent 1 of this monster
      uint256 parent1Id;

      // the unique ID associated with parent 2 of this monster
      uint256 parent2Id;

      // the address of the contract that minted this monster
      address minterContract;

      // the id of this monster within its specific contract
      uint256 contractOrder;

      // the generation of this monster
      uint256 gen;

      // used to calculate statistics and other things
      uint256 bits;

      // tracks the experience of this monster
      uint256 exp;

      // the monster's rarity
      uint256 rarity;
  }
}