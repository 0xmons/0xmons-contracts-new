const Test721Artifact = artifacts.require('./Test721.sol');
const TestDistributorArtifact = artifacts.require('./TestDistributor.sol');
const Test20Artifact = artifacts.require('./Test20.sol');
const NFTLotteryPoolArtifact = artifacts.require('./NFTLotteryPool.sol');
const NFTLotteryPoolFactoryArtifact = artifacts.require('./NFTLotteryPoolFactory.sol');

const Regenz = artifacts.require('./Regenz.sol');

module.exports = async(deployer) => {
  await deployer.deploy(Test721Artifact);
  await deployer.deploy(Test20Artifact);
  await deployer.deploy(TestDistributorArtifact);
  await deployer.deploy(NFTLotteryPoolArtifact);
  await deployer.deploy(
    NFTLotteryPoolFactoryArtifact, 
    Test20Artifact.address, 
    TestDistributorArtifact.address,
    web3.utils.toWei('2', 'ether'),
    NFTLotteryPoolArtifact.address);

  await deployer.deploy(Regenz);
}
