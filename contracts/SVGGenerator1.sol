// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;

import "@openzeppelin/contracts/utils/Strings.sol";

contract SVGGenerator1 {

  using Strings for uint256;
  uint256 private decimals = 1;
  uint256 private imageSize = 1024*(10**decimals);

  function createSVG(uint256 id, uint256 gasPrice) external view returns (string memory) {

    // number of columns/rows for the pattern, typically from 1-10
    uint256 numSides = _closestCube(id);

    // initial SVG string
    string memory svg = string(abi.encodePacked(
      '<svg viewBox="-', (imageSize/(numSides*20)).toString(),' -',
      (imageSize/(numSides*20)).toString(), ' ', imageSize.toString(), ' ', imageSize.toString(), '" xmlns="http://www.w3.org/2000/svg">'));

    // the amount of space each unit takes up (padding included)
    uint256 unitSize = (1024*(10**decimals))/numSides;

    // get initial color based on gas price
    (uint256 r, uint256 g, uint256 b) = getColor(gasPrice);

    for (uint256 i = 0; i < numSides; i++) {
      for (uint256 j = 0; j < numSides; j++) {
        uint256 duration = _getSeconds(i, j, id);
        svg = string(abi.encodePacked(svg, '<rect width="', (unitSize * 8 / 10).toString(),
          '" height="', (unitSize * 8 / 10).toString(), '" x="', (i*unitSize).toString(), '" y="', (j*unitSize).toString(),
          '" fill="rgb(', (r*duration/5).toString(), ',', g.toString(), ',', b.toString(), ')">'));
        svg = string(abi.encodePacked(svg, '<animate attributeName="rx" values="0;', (unitSize * 8 / 20).toString(), ';0" dur="',
          (duration).toString(), 's" repeatCount="indefinite"/>'));
        svg = string(abi.encodePacked(svg, '</rect>'));
      }
    }
    // Add text
    svg = string(abi.encodePacked(svg, '<text x="100" y="1000" font-size="100rem">', id.toString(), '</text></svg>'));
    return svg;
  }

  function _getSeconds(uint256 i, uint256 j, uint256 id) internal pure returns (uint256) {
    if (i < j) {
      if ((i*j*id) % 3 == 0) {
        return 4;
      }
      else if ((i*j*id) % 2 == 0) {
        return 6;
      }
    }
    else {
      if ((i*j*id) % 3 == 0) {
        return 5;
      }
      else if ((i*j*id) % 2 == 0) {
        return 3;
      }
    }
  }

  function _closestCube(uint256 id) internal pure returns (uint256) {
    for (uint256 i = 1; i <= 11; i++) {
      if (id <= i**3) {
        return i;
      }
    }
  }

  function getColor(uint256 gasPrice) internal pure returns(uint256, uint256, uint256) {
    if (gasPrice <= 2) {
      return (220, 20, 60);
    }
    if (gasPrice <= 4) {
      return (230, 215, 140);
    }
    if (gasPrice <= 8) {
      return (120, 240, 20);
    }
    if (gasPrice <= 16) {
      return (20, 200, 209);
    }
    if (gasPrice <= 32) {
      return (30, 150, 220);
    }
    if (gasPrice <= 64) {
      return (120, 100, 220);
    }
    if (gasPrice <= 128) {
      return (220, 160, 220);
    }
    if (gasPrice <= 256) {
      return (250, 200, 200);
    }
    if (gasPrice <= 512) {
      return (120, 120, 120);
    }
    if (gasPrice <= 1000) {
      return (20, 40, 20);
    }
  }

}