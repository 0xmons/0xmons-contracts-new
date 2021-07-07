// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "./VRFConsumerBase.sol";
import "./LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";

contract NFTLottery is VRFConsumerBase, ERC721Holder {

  bytes32 internal immutable keyHash;
  LinkTokenInterface public immutable link;

  mapping(bytes32 => address) public rewardAddress;
  mapping(bytes32 => uint256) public rewardId;

  // We have 2 ways of fulfilling randomness:

  // 1) sending an NFT to one address from list of addresses
  mapping(bytes32 => address[]) public addressRecipients;

  // 2) sending an NFT to one holder from a list of NFT holders
  mapping(bytes32 => address) public nftRecipientAddress;
  // Both start and end are inclusive indices
  mapping(bytes32 => uint256) public nftRecipientStart;
  mapping(bytes32 => uint256) public nftRecipientEnd;

  constructor(address _vrf, address _link, bytes32 _keyHash) 
    VRFConsumerBase(
      _vrf, _link
    ) public {
      link = LinkTokenInterface(_link);
      keyHash = _keyHash;
  }

  function distributeToAddresses(uint256 fee, address[] calldata recipients, address _rewardAddress, uint256 _rewardId) external {
    link.transferFrom(msg.sender, address(this), fee);
    IERC721(_rewardAddress).safeTransferFrom(msg.sender, address(this), _rewardId);
    bytes32 requestId = requestRandomness(keyHash, fee);
    addressRecipients[requestId] = recipients;
    rewardAddress[requestId] = _rewardAddress;
    rewardId[requestId] = _rewardId;
  }
  
  function distributeToNftHolders(uint256 fee, address _nftRecipientAddress, uint256 startIndex, uint256 endIndex, address _rewardAddress, uint256 _rewardId) external {
    link.transferFrom(msg.sender, address(this), fee);
    IERC721(_rewardAddress).safeTransferFrom(msg.sender, address(this), _rewardId);
    bytes32 requestId = requestRandomness(keyHash, fee);
    nftRecipientAddress[requestId] = _nftRecipientAddress;
    nftRecipientStart[requestId] = startIndex;
    nftRecipientEnd[requestId] = endIndex;
    rewardAddress[requestId] = _rewardAddress;
    rewardId[requestId] = _rewardId;
  }
  
  function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
    // Check what to fulfill:

    // If length of addressRecipients is 0, then it's an NFT distribution
    if (addressRecipients[requestId].length == 0) {
      uint256 startIndex = nftRecipientStart[requestId];
      uint256 endIndex = nftRecipientEnd[requestId];
      IERC721(rewardAddress[requestId]).transferFrom(
        address(this),
        IERC721(nftRecipientAddress[requestId]).ownerOf(randomness % (endIndex+1-startIndex) + startIndex),
        rewardId[requestId]
      );
      delete nftRecipientAddress[requestId];
      delete nftRecipientStart[requestId];
      delete nftRecipientEnd[requestId];
    }

    // Otherwise we pick a random address from the list
    else {
      address[] memory recipients = addressRecipients[requestId];
      IERC721(rewardAddress[requestId]).transferFrom(
        address(this),
        recipients[randomness % recipients.length],
        rewardId[requestId]
      );
      delete addressRecipients[requestId];
    }
    // Clean up state
    delete rewardAddress[requestId];
    delete rewardId[requestId];
  }

}