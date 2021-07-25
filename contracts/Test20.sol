// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Test20 is ERC20 {

  constructor() ERC20("Test", "TEST") public {}

  function mint(address a, uint256 amount) public {
    _mint(a, amount);
  }
}