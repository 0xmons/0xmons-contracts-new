// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Test721 is ERC721 {

  constructor() ERC721("Test721", "T721") public {}

  function mint(address to) public {
    _mint(to, totalSupply()+1);
  }

}
