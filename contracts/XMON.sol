// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract XMON is ERC20, Ownable {

  using SafeERC20 for IERC20;

  uint256 public transferFee;
  mapping (address => bool) public whitelist;

  constructor() ERC20("XMON", "XMON") public {
    _mint(msg.sender, 10000 ether);
    transferFee = 0;
  }

  function setWhitelist(address a, bool b) public onlyOwner {
    whitelist[a] = b;
  }

  // Transfer fee in integer percents
  function setTransferFee(uint256 fee) public onlyOwner {
    require(fee <= 10, "Fee cannot be greater than 10%");
    transferFee = fee;
  }

  // Transfer recipient recives amount - fee
  function transfer(address recipient, uint256 amount) public override returns (bool) {
    if (whitelist[_msgSender()] == false) {
      uint256 fee = transferFee.mul(amount).div(100);
      uint amountLessFee = amount.sub(fee);
      _transfer(_msgSender(), recipient, amountLessFee);
      _transfer(_msgSender(), address(this), fee);
    } else {
      _transfer(_msgSender(), recipient, amount);
    }
    return true;
  }

  // TransferFrom recipient receives amount - fee, sender's account is debited amount
  function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
    if (whitelist[recipient] == false) {
      uint256 fee = transferFee.mul(amount).div(100);
      uint amountLessFee = amount.sub(fee);
      amount = amountLessFee;
      _transfer(sender, address(this), fee);
    }
    _transfer(sender, recipient, amount);
    _approve(sender, _msgSender(), allowance(sender,_msgSender()).sub(amount, "ERC20: transfer amount exceeds allowance"));
    return true;
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) public onlyOwner {
    IERC20 _token = IERC20(tokenAddress);
    _token.safeTransfer(to, numTokens);
  }
}