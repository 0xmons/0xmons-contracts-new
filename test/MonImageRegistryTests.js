// const truffleAssert = require('truffle-assertions');
// const monImageRegistryFlatArtifact = artifacts.require('./MonImageRegistryFlat.sol');
// const xmonArtifact = artifacts.require('./XMON.sol');
// const monMinterArtifact = artifacts.require('./MonMinter.sol');

// contract("MonImageRegistry tests", async accounts => {
//   it ("does the things", async() => {

//     let monImageRegistry = await monImageRegistryFlatArtifact.deployed();
//     let XMON = await xmonArtifact.deployed();
//     let monMinter = await monMinterArtifact.deployed();

//     let expected, results;

//     // It handles image encoding and decoding (TODO)
//     let dataToEncode = web3.utils.fromAscii('hello');
//     let dataToEncode2 = web3.utils.fromAscii('hello2');
//     await monImageRegistry.uploadMon(dataToEncode);

//     // Only owner can set fee (and fee is actually set)
//     await monImageRegistry.setFee(1, {from: accounts[0]});
//     results = await monImageRegistry.fee();
//     expected = web3.utils.toBN(1);
//     expect(results).to.eql(expected);
//     await truffleAssert.reverts(
//       monImageRegistry.setFee(1, {from: accounts[1]})
//     );

//     // Only owner can set lock (and lock is actually set)
//     await monImageRegistry.setHashLock(0, true, {from: accounts[0]});
//     results = await monImageRegistry.isHashLocked(0);
//     expect(results).to.eql(true);
//     await truffleAssert.reverts(
//       monImageRegistry.setHashLock(1, true, {from: accounts[1]})
//     );

//     await monImageRegistry.setDataLock(0, true, {from: accounts[0]});
//     results = await monImageRegistry.isDataLocked(0);
//     expect(results).to.eql(true);
//     await truffleAssert.reverts(
//       monImageRegistry.setDataLock(1, true, {from: accounts[1]})
//     );

//     // Move the 0th token to accounts[1] (not owner)
//     await monMinter.safeTransferFrom(accounts[0], accounts[1], 0, {from: accounts[0]});
//     // ERC-721 holder can't register if their id is locked
//     await truffleAssert.reverts(
//       monImageRegistry.registerMon(0, dataToEncode, true, {from: accounts[1]}),
//       "locked"
//     );

//     // Set lock back to false
//     await monImageRegistry.setHashLock(0, false, {from: accounts[0]});

//     // Move 1 token to accounts[1] (fee has been reduced)
//     await XMON.transfer(accounts[1], web3.utils.toBN('1'), {from: accounts[0]});

//     // Approve monImageRegistry to spend 100 tokens
//     await XMON.approve(monImageRegistry.address, web3.utils.toBN('100'), {from: accounts[1]});

//     // Only owner (or ERC-721 holder) can register their tx hash
//     // Calling register actually stores the hash
//     await monImageRegistry.registerMon(0, dataToEncode, true, {from: accounts[1]});
//     await truffleAssert.reverts(
//       monImageRegistry.registerMon(0, dataToEncode, true, {from: accounts[0]})
//     );
//     results = await monImageRegistry.monDataWithStaticHash(0);
//     expect(web3.utils.toAscii(results)).to.eql('hello');

//     // Calling register actually deducts tokens
//     results = await XMON.balanceOf(accounts[1]);
//     expect(results).to.eql(web3.utils.toBN('0'));

//     // Only owner can move tokens
//     await monImageRegistry.moveTokens(XMON.address, accounts[0], 1, {from: accounts[0]});
//     await truffleAssert.reverts(
//       monImageRegistry.moveTokens(XMON.address, accounts[0], 1, {from: accounts[1]}) 
//     )

//     // Do it again, but for entireMonData
//     // Set lock back to false for data
//     await monImageRegistry.setDataLock(0, false, {from: accounts[0]});

//     // Move 1 token to accounts[1] (fee has been reduced)
//     await XMON.transfer(accounts[1], web3.utils.toBN('1'), {from: accounts[0]});

//     // Only owner (or ERC-721 holder) can register their data
//     // Calling register actually stores the hash
//     await monImageRegistry.registerEntireMonData(0, dataToEncode2, true, {from: accounts[1]});
//     await truffleAssert.reverts(
//       monImageRegistry.registerEntireMonData(0, dataToEncode2, true, {from: accounts[0]})
//     );
//     results = await monImageRegistry.monDataWithStatic(0);
//     expect(web3.utils.toAscii(results)).to.eql('hello2');

//     // Calling register actually deducts tokens
//     results = await XMON.balanceOf(accounts[1]);
//     expect(results).to.eql(web3.utils.toBN('0'));

//     // Only owner can set XMON token address
//     await monImageRegistry.setXmonToken(XMON.address, {from: accounts[0]});
//     await truffleAssert.reverts(
//       monImageRegistry.setXmonToken(XMON.address, {from: accounts[1]})
//     );

//     // Only owner can set mon address
//     await monImageRegistry.setMon(monMinter.address, {from: accounts[0]});
//     await truffleAssert.reverts(
//       monImageRegistry.setMon(monMinter.address, {from: accounts[1]})
//     );
//   });
// });