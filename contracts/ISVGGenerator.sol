// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

interface ISVGGenerator {

  function createSVG(uint256 id, uint256 gas) external returns (string memory);
}