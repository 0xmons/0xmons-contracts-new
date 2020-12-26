// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721Batcher {

  function getURIs(address erc721Address, address user) public view returns(string[] memory) {
    ERC721 nft = ERC721(erc721Address);
    uint256 numTokens = nft.balanceOf(user);
    string[] memory uriList = new string[](numTokens);
    for (uint256 i; i < numTokens; i++) {
      uriList[i] = nft.tokenURI(nft.tokenOfOwnerByIndex(user, i));
    }
    return(uriList);
  }

  function getIds(address erc721Address, address user) public view returns(uint256[] memory) {
    ERC721 nft = ERC721(erc721Address);
    uint256 numTokens = nft.balanceOf(user);
    uint256[] memory uriList = new uint256[](numTokens);
    for (uint256 i; i < numTokens; i++) {
      uriList[i] = nft.tokenOfOwnerByIndex(user, i);
    }
    return(uriList);
  }

}