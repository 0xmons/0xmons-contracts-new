// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "./IMonMinter.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

abstract contract MonCreatorInstance is AccessControl {

  using SafeERC20 for IERC20;
  using SafeMath for uint256;

  IERC20 public xmon;
  IMonMinter public monMinter;

  uint256 public maxMons;
  uint256 public numMons;

  // to be appended before the URI for the NFT
  string public prefixURI;

  modifier onlyAdmin {
    require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not admin");
    _;
  }

  function updateNumMons() public {
    require(numMons < maxMons, "All mons are out");
    numMons = numMons.add(1);
  }

  function setMaxMons(uint256 m) public onlyAdmin {
    maxMons = m;
  }

  function setPrefixURI(string memory prefix) public onlyAdmin {
    prefixURI = prefix;
  }
}