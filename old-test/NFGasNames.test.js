const namesArtifact = artifacts.require('./NFGasNames.sol');
const test721Artifact = artifacts.require('./Test721.sol');

// It checks permissions properly
contract("NFGasNames tests", async accounts => {
  it ("handles keccak256 correctly", async() => {
    let test721 = await test721Artifact.deployed();
    let names = await namesArtifact.deployed();

    for (let i = 0; i < 12; i++) {
      await test721.mint(accounts[0]);
    }

    await names.setName(12, "6");

    // for (let i = 0; i < 40; i++) {
    //   let ans = web3.utils.toBN(web3.utils.keccak256(i.toString()));
    //   console.log(i, ans.mod(web3.utils.toBN(1025)).toString());
    // }
  });
});