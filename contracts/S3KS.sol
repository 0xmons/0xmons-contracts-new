// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract S3KS is ERC20 {

  using SafeERC20 for IERC20;

  IERC20 public socks;
  IERC20 public sacks;
  IERC20 public sake;

  constructor() ERC20("S3KS", "S3KS") public {
    socks = IERC20(0x23B608675a2B2fB1890d3ABBd85c5775c51691d5);
    sacks = IERC20(0xa6610Ed604047e7B76C1DA288172D15BcdA57596);
    sake = IERC20(0xe9F84dE264E91529aF07Fa2C746e934397810334);
  }

  function getS3ks(uint256 amount) public {
    socks.safeTransferFrom(msg.sender, address(this), amount);
    sacks.safeTransferFrom(msg.sender, address(this), amount);
    sake.safeTransferFrom(msg.sender, address(this), amount);
    _mint(msg.sender, amount);
  }
}