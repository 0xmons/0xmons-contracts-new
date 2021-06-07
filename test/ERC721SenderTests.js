// const truffleAssert = require('truffle-assertions');
// const xmonArtifact = artifacts.require('./XMON.sol');
// const monMinterArtifact = artifacts.require('./MonMinter.sol');
// const erc721SenderArtifact = artifacts.require('./ERC721Sender.sol');

// // Allows setting rewards to multiple people
// // Allows taking rewards to multiple people
// // Expect taking reward to revert if you are not a holder
// // Allows sending rewards to multiple people

// contract("erc721Sender tests", async accounts => {
//   it ("allows setting/taking rewards to multiple people", async() => {
    
//     let xmon = await xmonArtifact.deployed();
//     let monMinter = await monMinterArtifact.deployed();
//     let erc721Sender = await erc721SenderArtifact.deployed();

//     // Set A to be monMinter
//     await monMinter.setMinterRole(accounts[0], {from: accounts[0]});

//     // Approve erc721Sender to spend A's XMON tokens
//     await xmon.approve(erc721Sender.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 

//     // Mint NFTs to A,B,C,D,E
//     await monMinter.mintMonster(accounts[0], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[1], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[2], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[3], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[4], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});

//     let startBalance = web3.utils.toBN(await xmon.balanceOf(accounts[0]));

//     // Send tokens to A,B,C,D,E
//     await erc721Sender.setRewards(
//       [monMinter.address, monMinter.address, monMinter.address, monMinter.address, monMinter.address],
//       [1,2,3,4,5],
//       xmon.address,
//       [1,2,3,4,5]
//     );

//     let endBalance = web3.utils.toBN(await xmon.balanceOf(accounts[0]));
//     let difference = startBalance.sub(endBalance);
//     let expected = web3.utils.toBN(15);
//     expect(difference.toString()).to.eql(expected.toString());

//     // Expect revert if someone else tries to claim the bounty
//     for (let i = 1; i < 6; i++) {
//       await truffleAssert.reverts(
//         erc721Sender.takeRewards(monMinter.address, i, xmon.address, {from: accounts[5]})
//       );
//     }
//     for (let i = 1; i < 6; i++) {
//       await truffleAssert.reverts(
//         erc721Sender.takeRewards(monMinter.address, i, xmon.address, {from: accounts[6]})
//       );
//     }

//     // Allow taking rewards from A,B.C.D.E
//     for (let i = 0; i < 5; i++) {
//       await erc721Sender.takeRewards(monMinter.address, i+1, xmon.address, {from: accounts[i]});
//     }

//     for (let i = 1; i < 5; i++) {
//       let balance = await xmon.balanceOf(accounts[i]);
//       expect(balance).to.eql(web3.utils.toBN(i+1));
//     }

//     // Ensure second rewards don't increase balance
//     for (let i = 0; i < 5; i++) {
//       await erc721Sender.takeRewards(monMinter.address, i+1, xmon.address, {from: accounts[i]});
//     }
//     for (let i = 1; i < 5; i++) {
//       let balance = await xmon.balanceOf(accounts[i]);
//       expect(balance).to.eql(web3.utils.toBN(i+1));
//     }
//   });

// });

// contract("erc721Sender tests", async accounts => {
//   it ("allows setting rewards to accumulate if set multiple times", async() => {
      
//     let xmon = await xmonArtifact.deployed();
//     let monMinter = await monMinterArtifact.deployed();
//     let erc721Sender = await erc721SenderArtifact.deployed();

//     // Set A to be monMinter
//     await monMinter.setMinterRole(accounts[0], {from: accounts[0]});

//     // Approve erc721Sender to spend A's XMON tokens
//     await xmon.approve(erc721Sender.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 

//     // Mint NFTs to A,B (B has ID = 2)
//     await monMinter.mintMonster(accounts[0], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[1], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});

//     for (let i = 1; i < 11; i++) {
//       await erc721Sender.setRewards(
//         [monMinter.address],
//         [2],
//         xmon.address,
//         [i]
//       );
//     }

//     // Take reward accumulated
//     await erc721Sender.takeRewards(monMinter.address, 2, xmon.address, {from: accounts[1]});    
//     balance = await xmon.balanceOf(accounts[1]);
//     expect(balance).to.eql(web3.utils.toBN(55));
//   });
// });

// contract("erc721Sender tests", async accounts => {
//   it ("allows sending rewards to multiple people", async() => {
    
//     let xmon = await xmonArtifact.deployed();
//     let monMinter = await monMinterArtifact.deployed();
//     let erc721Sender = await erc721SenderArtifact.deployed();

//     // Set A to be monMinter
//     await monMinter.setMinterRole(accounts[0], {from: accounts[0]});

//     // Approve erc721Sender to spend A's XMON tokens
//     await xmon.approve(erc721Sender.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 

//     // Mint NFTs to A,B,C,D,E
//     await monMinter.mintMonster(accounts[0], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[1], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[2], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[3], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});
//     await monMinter.mintMonster(accounts[4], 0, 0, accounts[0], 0, 0, 0, 0, 0, {from: accounts[0]});

//     let startBalance = web3.utils.toBN(await xmon.balanceOf(accounts[0]));

//     // Send tokens to A,B,C,D,E
//     await erc721Sender.sendRewards(
//       [monMinter.address, monMinter.address, monMinter.address, monMinter.address, monMinter.address],
//       [1,2,3,4,5],
//       xmon.address,
//       [1,2,3,4,5]
//     );

//     let endBalance = web3.utils.toBN(await xmon.balanceOf(accounts[0]));
//     let difference = startBalance.sub(endBalance);
//     let expected = web3.utils.toBN(14);
//     expect(difference.toString()).to.eql(expected.toString());

//     // Expect revert if someone else tries to claim the bounty
//     for (let i = 1; i < 6; i++) {
//       await truffleAssert.reverts(
//         erc721Sender.takeRewards(monMinter.address, i, xmon.address, {from: accounts[5]})
//       );
//     }
//     for (let i = 1; i < 6; i++) {
//       await truffleAssert.reverts(
//         erc721Sender.takeRewards(monMinter.address, i, xmon.address, {from: accounts[6]})
//       );
//     }

//     // Check balances for B.C.D.E
//     for (let i = 1; i < 5; i++) {
//       let balance = await xmon.balanceOf(accounts[i]);
//       expect(balance).to.eql(web3.utils.toBN(i+1));
//     }
//   });

// });