// const truffleAssert = require('truffle-assertions');
// const monStakerArtifact = artifacts.require('./MonStaker2.sol');
// const doomRewarderArtifact = artifacts.require('./DoomRewarder.sol');

// // It checks permissions properly
// contract("doomRewarder tests", async accounts => {
//   it ("handles permissions correctly / sets variables", async() => {
//     let doomRewarder = await doomRewarderArtifact.deployed();
//     let monStaker = await monStakerArtifact.deployed();

//     // Ensure only owner can addBounty
//     await doomRewarder.addBounty(web3.utils.soliditySha3("hello"), 1, 1, {from: accounts[0]});
//     await truffleAssert.reverts(
//       doomRewarder.addBounty(web3.utils.soliditySha3("hello"), 1, 1, {from: accounts[1]})
//     );

//     // Ensure only owner can set validity of bounty
//     await doomRewarder.setBountyInvalidity(1, true, {from: accounts[0]});
//     await truffleAssert.reverts(
//       doomRewarder.setBountyInvalidity(1, true, {from: accounts[1]})
//     );

//     // Ensure only owner can setIDoomAdmin
//     await doomRewarder.setIDoomAdmin(monStaker.address, {from: accounts[0]});
//     await truffleAssert.reverts(
//       doomRewarder.setIDoomAdmin(monStaker.address, {from: accounts[1]})
//     );

//     // Ensure only owner can yeet
//     await truffleAssert.reverts(
//       doomRewarder.yeet({from: accounts[1]})
//     );
//     await doomRewarder.yeet({from: accounts[0]});
//   });
// });

// // It allows the setting / taking of bounties
// contract("doomRewarder tests", async accounts => {
//   it ("handles permissions correctly / sets variables", async() => {
//     let doomRewarder = await doomRewarderArtifact.deployed();
//     let monStaker = await monStakerArtifact.deployed();
//     let result;
//     let expected;

//     // Set doomRewarder to be admin
//     await monStaker.setStakerAdminRole(doomRewarder.address, {from: accounts[0]});

//     // Set bounty
//     await doomRewarder.addBounty(web3.utils.soliditySha3("hello"), 10, 1, {from: accounts[0]});

//     // Claim bounty
//     await doomRewarder.claimBounty(1, "hello", {from: accounts[0]});

//     result = await monStaker.doomBalances(accounts[0]);
//     expected = web3.utils.toBN(10);
//     expect(result).to.eql(expected);

//     // Expect to revert if already claimed
//     await truffleAssert.reverts(
//       doomRewarder.claimBounty(1, "hello", {from: accounts[0]}),
//       "already claimed"
//     );

//     // Expect to revert if numClaimers already met
//     await truffleAssert.reverts(
//       doomRewarder.claimBounty(1, "hello", {from: accounts[1]}),
//       "already out"
//     );

//     // Set new bounty (ID = 2)
//     await doomRewarder.addBounty(web3.utils.soliditySha3("trap"), 2, 2, {from: accounts[0]});

//     // expect that a claim with the wrong password leads to no DOOM boost
//     await doomRewarder.claimBounty(2, "hello", {from: accounts[1]});
//     result = await monStaker.doomBalances(accounts[1]);
//     expected = web3.utils.toBN(0);
//     expect(result).to.eql(expected);

//     // allow someone else to claim the bounty
//     await doomRewarder.claimBounty(2, "trap", {from: accounts[1]});
//     result = await monStaker.doomBalances(accounts[1]);
//     expected = web3.utils.toBN(2);
//     expect(result).to.eql(expected);

//     // Set the bounty to be invalid
//     await doomRewarder.setBountyInvalidity(2, true, {from: accounts[0]});
//     // Expect it to fail with "now invalid"
//     await truffleAssert.reverts(
//       doomRewarder.claimBounty(2, "hello", {from: accounts[1]}),
//       "now invalid"
//     );
//   });
// });