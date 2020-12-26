// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

interface IWhitelist {
  function whitelist(address a) external returns (bool);
}