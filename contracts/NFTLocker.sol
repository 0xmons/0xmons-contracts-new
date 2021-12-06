// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract NFTLocker is ERC721Holder, ERC1155Holder {

  struct ERC721Lockup {
    address owner;
    uint64 endTime;
    address nftAddress;
    uint256 nftId;
  }

  struct ERC1155Lockup {
    address owner;
    uint64 endTime;
    address nftAddress;
    uint256 nftId;
    uint256 amount;
  }

  uint256 public counterFor721;
  uint256 public counterFor1155;

  mapping(uint256 => ERC721Lockup) public erc721LockupMap;
  mapping(uint256 => ERC1155Lockup) public erc1155LockupMap;

  function create721Lockup(address nftAddress, uint64 endTime, uint256 nftId) public {
    require(isEOA(msg.sender), "Owner must be EOA");
    counterFor721 += 1;
    erc721LockupMap[counterFor721] = ERC721Lockup(
      msg.sender,
      endTime,
      nftAddress,
      nftId
    );
    IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), nftId);
  }

  function create1155Lockup(address nftAddress, uint64 endTime, uint256 nftId, uint256 amount)  public {
    require(isEOA(msg.sender), "Owner must be EOA");
    counterFor1155 += 1;
    erc1155LockupMap[counterFor1155] = ERC1155Lockup(
      msg.sender,
      endTime,
      nftAddress,
      nftId,
      amount
    );
    IERC1155(nftAddress).safeTransferFrom(msg.sender, address(this), nftId, amount, "");
  }

  function unlock721(uint256 lockId) public {
    ERC721Lockup memory lockup = erc721LockupMap[lockId];
    require(block.timestamp >= lockup.endTime, "Not time yet");
    IERC721(lockup.nftAddress).safeTransferFrom(address(this), lockup.owner, lockup.nftId);
    delete erc721LockupMap[lockId];
  }

  function unlock1155(uint256 lockId) public {
    ERC1155Lockup memory lockup = erc1155LockupMap[lockId];
    require(block.timestamp >= lockup.endTime, "Not time yet");
    IERC1155(lockup.nftAddress).safeTransferFrom(address(this), lockup.owner, lockup.nftId, lockup.amount, "");
    delete erc1155LockupMap[lockId];
  }
  
  function isEOA(address _addr) private returns (bool isEOA) {
    uint32 size;
    assembly {
      size := extcodesize(_addr)
    }
    return (size > 0);
  }
}
