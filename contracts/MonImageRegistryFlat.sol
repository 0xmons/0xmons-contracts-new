// File: @openzeppelin/contracts/GSN/Context.sol

// SPD-License-Identifier: MIT
pragma solidity ^0.6.8;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol

// SPD-License-Identifier: MIT

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = _msgSender();
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(_owner == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: @openzeppelin/contracts/introspection/IERC165.sol

// SPD-License-Identifier: MIT

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File: @openzeppelin/contracts/token/ERC721/IERC721.sol

// SPD-License-Identifier: MIT


/**
 * @dev Required interface of an ERC721 compliant contract.
 * Removed to only keep ownerOf
 */
interface IERC721 is IERC165 {

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

}

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

// SPD-License-Identifier: MIT

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);
}

// File: contracts/MonImageRegistry.sol

// SPD-License-Identifier: AGPL-3.0-or-later

contract MonImageRegistryFlat is Ownable {

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
