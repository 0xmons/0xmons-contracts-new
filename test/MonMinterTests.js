// const truffleAssert = require('truffle-assertions');
// const xmonArtifact = artifacts.require('./XMON.sol');
// const monMinterArtifact = artifacts.require('./MonMinter.sol');

// contract("monMinter tests", async accounts => {
//   it ("allows setting all of the variables", async() => {
    
//     let xmon = await xmonArtifact.deployed();
//     let monMinter = await monMinterArtifact.deployed();

//     // ensure admin role can call grantRole to itself
//     // ensure other account can't call grantRole
//     await monMinter.grantRole(web3.utils.asciiToHex("0"), accounts[1], {from: accounts[0]});
//     await truffleAssert.reverts(
//       monMinter.grantRole(web3.utils.asciiToHex("0"), accounts[1], {from: accounts[1]})
//     )

//     // ensure that admin role can set minters and other accounts can't
//     await monMinter.setMinterRole(accounts[0], {from: accounts[0]});
//     await truffleAssert.reverts(
//       monMinter.setMinterRole(accounts[0], {from: accounts[1]})
//     );

//     // ensure mintMonster fails when the caller doesn't have minter role
//     // ensure mintMonster succeeds when the caller has the minter role
//     await monMinter.mintMonster(accounts[0], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await truffleAssert.reverts(
//       monMinter.mintMonster(
//         accounts[0], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[1]})
//     );

//     // ensure the caller of the constructor gets the 0 monster
//     let mon0Owner = await monMinter.ownerOf(0);
//     expect(mon0Owner).to.eql(accounts[0]);

//     // ensure that modifyMonster fails when the caller doesn't have the minter role
//     // ensure modifyMonster succeeds when the caller has the minter role
//     // ensure modifyMonster only sets some values when the ignoreZeros flag is true
//     await monMinter.modifyMon(0, false, 1, 11, accounts[1], 1111, 2, 3, 4, 5, {from: accounts[0]});
//     let mon0 = await monMinter.monRecords(0);
//     expect(mon0["summoner"]).to.eql(accounts[0]);
//     expect(mon0["parent1Id"]).to.eql(web3.utils.toBN(1));
//     expect(mon0["parent2Id"]).to.eql(web3.utils.toBN(11));
//     expect(mon0["minterContract"].toString()).to.eql(accounts[1].toString());
//     expect(mon0["contractOrder"]).to.eql(web3.utils.toBN(1111));
//     expect(mon0["gen"]).to.eql(web3.utils.toBN(2));
//     expect(mon0["bits"]).to.eql(web3.utils.toBN(3));
//     expect(mon0["exp"]).to.eql(web3.utils.toBN(4));
//     expect(mon0["rarity"]).to.eql(web3.utils.toBN(5));

//     await monMinter.modifyMon(0, true, 0, 0, "0x0000000000000000000000000000000000000000", 0, 0, 0, 0, 10, {from: accounts[0]});
//     mon0 = await monMinter.monRecords(0);
//     expect(mon0["parent1Id"]).to.eql(web3.utils.toBN(1));
//     expect(mon0["parent2Id"]).to.eql(web3.utils.toBN(11));
//     expect(mon0["minterContract"].toString()).to.eql(accounts[1].toString());
//     expect(mon0["contractOrder"]).to.eql(web3.utils.toBN(1111));
//     expect(mon0["gen"]).to.eql(web3.utils.toBN(2));
//     expect(mon0["bits"]).to.eql(web3.utils.toBN(3));
//     expect(mon0["exp"]).to.eql(web3.utils.toBN(4));
//     expect(mon0["rarity"]).to.eql(web3.utils.toBN(10));

//     await monMinter.modifyMon(0, true, 10, 110, accounts[2], 11110, 20, 30, 40, 50, {from: accounts[0]});
//     mon0 = await monMinter.monRecords(0);
//     expect(mon0["parent1Id"]).to.eql(web3.utils.toBN(10));
//     expect(mon0["parent2Id"]).to.eql(web3.utils.toBN(110));
//     expect(mon0["minterContract"].toString()).to.eql(accounts[2].toString());
//     expect(mon0["contractOrder"]).to.eql(web3.utils.toBN(11110));
//     expect(mon0["gen"]).to.eql(web3.utils.toBN(20));
//     expect(mon0["bits"]).to.eql(web3.utils.toBN(30));
//     expect(mon0["exp"]).to.eql(web3.utils.toBN(40));
//     expect(mon0["rarity"]).to.eql(web3.utils.toBN(50));

//     await truffleAssert.reverts(
//       monMinter.modifyMon(0, false, 0, 0, accounts[3], 0, 2, 3, 4, 5, {from: accounts[1]})
//     );

//     // ensure setBaseURI fails when caller doesn't have admin role
//     // ensure setBaseURI succeeds when caller has admin role
//     await monMinter.setBaseURI("test.com/", {from: accounts[0]});
//     let baseURI = await monMinter.baseURI();
//     expect(baseURI).to.eql("test.com/");
//     await truffleAssert.reverts(
//       monMinter.setBaseURI("test.com/", {from: accounts[1]})
//     );

//     // ensure setTokenURI fails when caller doesn't have minter role
//     // ensure setTokenURI succeeds when caller has minter role, and that concatenation works
//     await monMinter.setTokenURI(0, "test", {from: accounts[0]});
//     let mon0URI = await monMinter.tokenURI(0);
//     expect(mon0URI).to.eql("test.com/test");
//     await truffleAssert.reverts(
//       monMinter.setTokenURI(0, "test", {from: accounts[1]})
//     );
       

//     // ensure moveTokens fails when caller doesn't have admin role
//     // ensure moveToken succeeds when caller has admin role
//     await truffleAssert.reverts(
//       monMinter.moveTokens(xmon.address, accounts[0], 0, {from: accounts[1]})
//     )
//     await monMinter.moveTokens(xmon.address, accounts[0], 0, {from: accounts[0]});

//     // ensure setRarityTitle fails when caller doesn't have admin role
//     // ensure setRarityTitle succeeds when caller has admin role
//     await monMinter.setRarityTitle(0, "test", {from: accounts[0]});
//     let rarity0 = await monMinter.rarityTable(0);
//     expect(rarity0).to.eql("test");
//     await truffleAssert.reverts(
//       monMinter.setRarityTitle(0, "test", {from: accounts[1]})
//     );
//   });
// });