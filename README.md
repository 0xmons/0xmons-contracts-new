# 0xmons Smart Contracts

### Architecture
The main contract is `MonMinter.sol`, which is the actual ERC-721 implementation. Using AccessControl, we can assign different contracts to be monster minters. 

`IMonMinter.sol` is the minter interface, which is exposed to contracts with minting privileges, allowing them to mint and modify the on-chain data of monsters.

The default `Mon` struct is in `UsesMon.sol`. Contracts which want to access on-chain information about a monster inherit from this contract to use the struct.

`MonCreatorInstance` is a parent class that abstracts out some similarities among contracts which want to mint monsters.

`MonStaker.sol` is the main staking contract. Users can add and remove their staked XMON to generate Doom, which is then used to redeem monsters. 

`MonSpawner.sol` is the spawning contract, which takes in two monsters and spawns a new monster.

The underlying token is `XMON.sol`, a token with a fee on transfer, settable from 1 to 10%.

### Tests
There is a comprehensive set of tests in `test/tests.js`. Test coverage is close to 100%, and the comments explain the cases being tested for. See `coverage/`.
