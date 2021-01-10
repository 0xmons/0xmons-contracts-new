// Just for testing
let XMON = artifacts.require('./XMON.sol');

let MonMinter = artifacts.require('./MonMinter.sol');
let MonStaker = artifacts.require('./MonStaker2.sol');
let MonSpawner = artifacts.require('./MonSpawner.sol');
let DoomRewarder = artifacts.require('./DoomRewarder.sol');

let testing = false;
let live = !testing;

module.exports = async(deployer) => {

  // Just for testing
  if (testing) {
    await deployer.deploy(XMON);
    await deployer.deploy(MonMinter);
    await deployer.deploy(MonStaker, XMON.address, MonMinter.address);
    await deployer.deploy(MonSpawner, XMON.address, MonMinter.address);
    await deployer.deploy(DoomRewarder, MonStaker.address);
  }

  if (live) {
    // await deployer.deploy(MonSpawner, '0x3aaDA3e213aBf8529606924d8D1c55CbDc70Bf74', '0x0427743df720801825a5c82e0582b1e915e0f750');
    // await deployer.deploy(DoomRewarder, '0x0427743df720801825a5c82e0582b1e915e0f750');
  }

}
