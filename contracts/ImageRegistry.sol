// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.6.8;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/math/SafeMath.sol";

contract ImageRegistry {

  event BytesE(bytes b);
  event UintsE(uint256[] a);

  function saveBytes(bytes calldata b) external {
  }

  function saveBytesE(bytes calldata b) external {
    emit BytesE(b);
  }

  function saveUints(uint256[] calldata d) external {
  }

  function saveUintsE(uint256[] calldata d) external {
     emit UintsE(d);
  }
}