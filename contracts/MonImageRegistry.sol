// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MonImageRegistry is Ownable {

  event hashChanged(uint256 indexed id, bytes oldHash, bytes newHash);
  event dataChanged(uint256 indexed id);

  mapping(uint256 => bytes) public monDataWithAnimation;
  mapping (uint256 => bytes) public monDataWithAnimationHash;
  mapping(uint256 => bytes) public monDataWithStatic;
  mapping (uint256 => bytes) public monDataWithStaticHash;
  mapping(uint256 => bool) public isHashLocked;
  mapping(uint256 => bool) public isDataLocked;

  uint256 public fee;
  IERC721 public mon;
  IERC20 public xmonToken;

  constructor(address erc721Add, address tokenAdd) public {
    mon = IERC721(erc721Add);
    xmonToken = IERC20(tokenAdd);
    fee = 10**18;
  }

  function uploadMon(bytes calldata s) external {}

  function registerMon(uint256 id, bytes calldata txHash, bool isStatic) external {
    require((msg.sender == mon.ownerOf(id) || msg.sender == owner()), "Not owner/admin");
    require(!isHashLocked[id], "locked");
    if (isStatic) {
      emit hashChanged(id, monDataWithStaticHash[id], txHash);
      monDataWithStaticHash[id] = txHash;
    }
    else {
      emit hashChanged(id, monDataWithAnimationHash[id], txHash);
      monDataWithAnimationHash[id] = txHash;
    }
    xmonToken.transferFrom(msg.sender, address(this), fee);
  }

  function registerEntireMonData(uint256 id, bytes calldata data, bool isStatic) external {
    require((msg.sender == mon.ownerOf(id) || msg.sender == owner()), "Not owner/admin");
    require(!isDataLocked[id], "locked");
    if (isStatic) {
      monDataWithStatic[id] = data;
    }
    else {
      monDataWithAnimation[id] = data;
    }
    emit dataChanged(id);
    xmonToken.transferFrom(msg.sender, address(this), fee);
  }

  function setFee(uint256 f) external onlyOwner {
    fee = f;
  }

  function setHashLock(uint256 id, bool b) external onlyOwner {
    isHashLocked[id] = b;
  }

  function setDataLock(uint256 id, bool b) external onlyOwner {
    isDataLocked[id] = b;
  }

  function moveTokens(address tokenAddress, address to, uint256 numTokens) external onlyOwner {
    IERC20 _token = IERC20(tokenAddress);
    _token.transfer(to, numTokens);
  }

  function setXmonToken(address a) external onlyOwner {
    xmonToken = IERC20(a);
  }

  function setMon(address a) external onlyOwner {
    mon = IERC721(a);
  }
}