// const truffleAssert = require('truffle-assertions');
// const timeMachine = require('ganache-time-traveler');
// const xmonArtifact = artifacts.require('./XMON.sol');
// const monMinterArtifact = artifacts.require('./MonMinter.sol');
// // Note the naming here for convenience
// const monStakerArtifact = artifacts.require('./MonStaker2.sol');

// contract("monStaker tests", async accounts => {
//   it ("sets all variables correctly", async() => {

//     let xmon = await xmonArtifact.deployed();
//     let monStaker = await monStakerArtifact.deployed();
//     let result = undefined;

//     // Ensure only the owner can set rarity
//     // Ensure only the owner can set maxStake
//     // Ensure only the owner can set baseDoomFee
//     // Ensure only the owner can set doomMultiplier
//     // Ensure only the owner can set maxMons
//     // Ensure only the owner can set prefixURI

//     await monStaker.setRarity(10, {from: accounts[0]});
//     result = await monStaker.rarity();
//     expect(result).to.eql(web3.utils.toBN(10));
//     await truffleAssert.reverts(
//       monStaker.setRarity(10, {from: accounts[1]})
//     );

//     await monStaker.setMaxStake(1, {from: accounts[0]});
//     result = await monStaker.maxStake();
//     expect(result).to.eql(web3.utils.toBN(1));
//     await truffleAssert.reverts(
//       monStaker.setMaxStake(1, {from: accounts[1]})
//     );

//     await monStaker.setBaseDoomFee(2, {from: accounts[0]});
//     result = await monStaker.baseDoomFee();
//     expect(result).to.eql(web3.utils.toBN(2));
//     await truffleAssert.reverts(
//       monStaker.setBaseDoomFee(2, {from: accounts[1]})
//     );

//     await monStaker.setDoomMultiplier(3, {from: accounts[0]});
//     result = await monStaker.doomMultiplier();
//     expect(result).to.eql(web3.utils.toBN(3));
//     await truffleAssert.reverts(
//       monStaker.setDoomMultiplier(3, {from: accounts[1]})
//     );

//     await monStaker.setMaxMons(5, {from: accounts[0]});
//     result = await monStaker.maxMons();
//     expect(result).to.eql(web3.utils.toBN(5));
//     await truffleAssert.reverts(
//       monStaker.setMaxMons(5, {from: accounts[1]})
//     );

//     await monStaker.setPrefixURI("test", {from: accounts[0]});
//     result = await monStaker.prefixURI();
//     expect(result).to.eql("test");
//     await truffleAssert.reverts(
//       monStaker.setPrefixURI("test2", {from: accounts[1]})
//     );

//     // Ensure that moveTokens fails when another account calls it
//     // Ensure that moveTokens fails when when the owner calls it with the xmon address
//     await truffleAssert.reverts(
//       monStaker.moveTokens(xmon.address, accounts[0], 0, {from: accounts[1]})
//     );
//     await truffleAssert.reverts(
//       monStaker.moveTokens(xmon.address, accounts[0], 0, {from: accounts[0]})
//     );

//     // Ensure that A can grant STAKER_ADMIN_ROLE to C
//     // Ensure that B can't grant STAKER_ADMIN_ROLE to C
//     await monStaker.setStakerAdminRole(accounts[2], {from: accounts[0]});
//     await truffleAssert.reverts(
//       monStaker.setStakerAdminRole(accounts[1], {from: accounts[1]})
//     );

//     // Ensure C can modify doomBalance
//     // Ensure that B can't modify doomBalance
//     await monStaker.setDoomBalances(accounts[0], 1, {from: accounts[2]});
//     result = await monStaker.doomBalances(accounts[0]);
//     expect(result).to.eql(web3.utils.toBN(1));
//     await truffleAssert.reverts(
//       monStaker.setDoomBalances(accounts[0], 1, {from: accounts[1]})
//     );
//   });

//   contract("monStaker tests", async accounts => {
//     it ("processes add stake / remove stake correctly", async() => {
//       let xmon = await xmonArtifact.deployed();
//       let monStaker = await monStakerArtifact.deployed();
//       let result = undefined;
  
//       /*
//       Whitelist the staker contract
//       Add a 1% fee
//       Set the maxStake to be 100 tokens
//       */
//       await xmon.setWhitelist(monStaker.address, true, {from: accounts[0]});
//       await xmon.setTransferFee(1, {from: accounts[0]});
//       await monStaker.setMaxStake(10, {from: accounts[0]});
  
//       // Ensure staking of 0 fails
//       await truffleAssert.reverts(
//         monStaker.addStake(0, {from: accounts[0]}),
//         "Need to stake nonzero"
//       )
  
//       /*
//       - A deposits 100 XMON tokens into the staker
//       - Ensure that the stake correctly counts this as 100 tokens
//       - Ensure the staker contract now has 100 XMON tokens
//       - A removes stake
//       - Ensure that A now has 100 more tokens
//       - Ensure that the staker contract now has 0 XMON tokens
//       - Ensure that the stakeRecord for A is now all 0s
//       */
//       await xmon.approve(monStaker.address, 10000000000, {from: accounts[0]}); 
//       await monStaker.setMaxStake(1000, {from: accounts[0]});
//       await monStaker.addStake(100);
//       result = await monStaker.stakeRecords(accounts[0]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(100));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(100));
//       await monStaker.removeStake();
//       result = await monStaker.stakeRecords(accounts[0]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(0));
//       expect(result["startBlock"]).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN('10000000000000000000000'));
  
//       /*
//       - A deposits 100 XMON tokens into the staker
//       - A deposits 100 more XMON tokens into the staker
//       - Ensure the staker counts A's amount as 200 XMON tokens
//       - Remove stake
//       - Ensure A has 200 tokens back
//       - Ensure the staker contract has none
//       */
//       await monStaker.addStake(100, {from: accounts[0]});
//       await monStaker.addStake(100, {from: accounts[0]});
//       result = await monStaker.stakeRecords(accounts[0]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(200));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(200));
//       await monStaker.removeStake();
//       result = await monStaker.stakeRecords(accounts[0]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN('10000000000000000000000'));
  
//       /*
//       - A has 10 XMON tokens.
//       - A deposits 10 XMON tokens into the staker
//       - A emergency withdraws
//       - Ensure that A gets 100 XMON tokens back 
//       */
//       await monStaker.addStake(100, {from:accounts[0]});
//       await monStaker.emergencyRemoveStake({from:accounts[0]});
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN('10000000000000000000000'));
  
//       /* Remove monStaker from whitelist
//         - Ensure that addStake reverts
//       */
//       await xmon.setWhitelist(monStaker.address, false, {from: accounts[0]});
//       await truffleAssert.reverts(
//         monStaker.addStake(100, {from: accounts[0]}),
//         "Staker not whitelisted!"
//       );
//     });
//   });

//   contract("monStaker tests", async accounts => {
//     it ("handles doom calculations correctly", async() => {
//       let xmon = await xmonArtifact.deployed();
//       let monStaker = await monStakerArtifact.deployed();
//       let result = undefined;
  
//       // set staker to whitelist
//       await xmon.setWhitelist(monStaker.address, true, {from: accounts[0]});
  
//       // init tx fee
//       await xmon.setTransferFee(1, {from: accounts[0]});
  
//       // approve stakers
//       await xmon.approve(monStaker.address, 10000000000, {from: accounts[0]}); 
//       await xmon.approve(monStaker.address, 10000000000, {from: accounts[1]}); 
  
//       // set max stake
//       await monStaker.setMaxStake(1000, {from: accounts[0]});
  
//       /*
//       - A has 10 XMON tokens.
//       - A deposits 10 XMON tokens into the staker
//       - Wait 9 blocks
//       - Ensure that A now has 100 doom (on the 10th block)
//       */
//       await monStaker.addStake(100, {from:accounts[0]});
//       for (let i = 0; i < 9; i++) {
//         await timeMachine.advanceBlock();
//       }
//       await monStaker.removeStake({from: accounts[0]});
//       result = await monStaker.doomBalances(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(1000));
  
//       /*
//       - A deposits 10 XMON tokens into the staker
//       - B has 100 XMON tokens.
//       - B deposits 100 XMON tokens into the staker
//       - Ensure that the stake correctly counts this as 100 tokens
//       - Ensure the staker contract now has 10+110 = 110 XMON tokens
  
//       - Wait 9 blocks
  
//       - A withdraws
//       - Ensure that A gets 10 XMON back 
//       - Ensure that A now has 1120 (1000 doom from earlier, 9 blocks)
  
//       - Ensure that the staker contract now has 99 XMON tokens
//       - B withdraws
//       - Ensure that B gets 99 XMON back
//       - Ensure that B now has 990 doom
//       */
//       await monStaker.addStake(10, {from:accounts[0]});
//       await xmon.transfer(accounts[1], 1000, {from:accounts[0]});
//       // Note B only gets 990 tokens because 1 % tx fee
//       await monStaker.addStake(100, {from:accounts[1]});
  
//       result = await monStaker.stakeRecords(accounts[1]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(100));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(110));
  
//       for (let i = 0; i < 9; i++) {
//         await timeMachine.advanceBlock();
//       }
//       await monStaker.removeStake({from: accounts[0]});
//       result = await monStaker.doomBalances(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(1120));
  
//       await monStaker.removeStake({from: accounts[1]});
//       result = await monStaker.stakeRecords(accounts[1]);
//       expect(result["amount"]).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(0));
//       result = await xmon.balanceOf(accounts[1]);
//       expect(result).to.eql(web3.utils.toBN(990));
  
//       /*
//       - Reduce maxStake to be 1 token
//       - A deposits 10 XMON tokens
//       - Expect a revert
//       */
//       await monStaker.setMaxStake(1, {from: accounts[0]});
//       await truffleAssert.reverts(
//         monStaker.addStake(10, {from: accounts[0]})
//       );
  
//       /*
//       - A deposits 10 XMON tokens
//       - Wait 9 blocks
//       - Call awardDoom
//       - Ensure A has 100 doom
//       - Ensure contract still has 100 tokens
//       - Ensure contract has new starttime
//       */
//       await monStaker.setMaxStake(100, {from: accounts[0]});
//       await monStaker.addStake(10, {from: accounts[0]});
//       let start = await monStaker.stakeRecords(accounts[0]);
//       for (let i = 0; i < 9; i++) {
//         await timeMachine.advanceBlock();
//       }
//       await monStaker.awardDoom(accounts[0]);
//       result = await monStaker.doomBalances(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(1220));
//       let end = await monStaker.stakeRecords(accounts[0]);
//       expect(end["startBlock"].toNumber()).to.be.above(start["startBlock"].toNumber());
  
//       /*
//       - A deposits 10 XMON tokens
//       - Wait 10 blocks
//       - Ensure pendingDoom returns 100
//       */
//       await monStaker.removeStake({from: accounts[0]});
//       await monStaker.addStake(10, {from: accounts[0]});
//       for (let i = 0; i < 10; i++) {
//         await timeMachine.advanceBlock();
//       }
//       result = await monStaker.pendingDoom(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(100));
//       result = await xmon.balanceOf(monStaker.address);
//       expect(result).to.eql(web3.utils.toBN(10));
//     });
//   });

//   contract("monStaker tests", async accounts => {
//     it ("handles monsterMinting correctly", async() => {
//       let xmon = await xmonArtifact.deployed();
//       let monMinter = await monMinterArtifact.deployed();
//       let monStaker = await monStakerArtifact.deployed();
//       let result = undefined;
  
//       // set staker to whitelist
//       await xmon.setWhitelist(monStaker.address, true, {from: accounts[0]});
  
//       // init tx fee
//       await xmon.setTransferFee(1, {from: accounts[0]});
  
//       // approve stakers for A and B
//       await xmon.approve(monStaker.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 
//       await xmon.approve(monStaker.address, 10000000000, {from: accounts[1]}); 
  
//       // set configs
//       await monStaker.setMaxStake(1000, {from: accounts[0]});
  
//       // set monStaker to be minter
//       await monMinter.setMinterRole(monStaker.address, {from: accounts[0]});
  
//       // Set URIs
//       await monMinter.setBaseURI("test.com/", {from: accounts[0]});
//       await monStaker.setPrefixURI("staker/", {from: accounts[0]});
  
//       /*
//       - Set doomFee to be 100
//       - A deposits 10 XMON tokens
  
//       - Wait 5 blocks
//       - Ensure that claimMon reverts due to insufficient DOOM
//       - Wait 5 more blocks
//       - Ensure that claimMon reverts due to maxMons too low 
//       - Sets maxMons to be high enough
//       - Ensure that claimMon succeeds
      
//       - Ensure totalSupply = 2
//       - Ensure numMons = 1
  
//       - Ensure that the claimed monster (lookup through monMinter) has:
//       - summoner == A's address
//       - parent1Id == 0
//       - parent2Id == 0
//       - minterContract == monStaker.address
//       - contractOrder = 1
//       - gen == 1
//       - exp == 0
//       - rarity == 1
      
//       - Ensure that numSummons[A] = 1
//       */
//       await monStaker.setBaseDoomFee(100, {from: accounts[0]});
  
//       await monStaker.addStake(10, {from: accounts[0]});
//       for (let i = 0; i < 4; i++) {
//         await timeMachine.advanceBlock();
//       }
//       for (let i = 0; i < 4; i++) {
//         await timeMachine.advanceBlock();
//       }
  
//       await monStaker.setMaxMons(100, {from:accounts[0]});
  
//       await monStaker.claimMon({from:accounts[0]});
//       result = await monStaker.doomBalances(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(0));
//       result = await monMinter.totalSupply();
//       expect(result).to.eql(web3.utils.toBN(2));
//       result = await monStaker.numMons();
//       expect(result).to.eql(web3.utils.toBN(1));
  
//       result = await monMinter.monRecords(1);
//       expect(result["summoner"]).to.eql(accounts[0]);
//       expect(result["parent1Id"]).to.eql(web3.utils.toBN(0));
//       expect(result["parent2Id"]).to.eql(web3.utils.toBN(0));
//       expect(result["minterContract"].toString()).to.eql(monStaker.address.toString());
//       expect(result["contractOrder"]).to.eql(web3.utils.toBN(1));
//       expect(result["gen"]).to.eql(web3.utils.toBN(1));
//       expect(result["exp"]).to.eql(web3.utils.toBN(0));
//       expect(result["rarity"]).to.eql(web3.utils.toBN(1));
//       result = await monMinter.tokenURI(1);
//       expect(result.toString()).to.eql("test.com/staker/1");
  
//       result = await monStaker.numSummons(accounts[0]);
//       expect(result).to.eql(web3.utils.toBN(1));
//     });
//   });

//   contract("monStaker tests", async accounts => {
//     it ("handles large scale txs correctly", async() => {
//       let xmon = await xmonArtifact.deployed();
//       let monMinter = await monMinterArtifact.deployed();
//       let monStaker = await monStakerArtifact.deployed();
//       let result = undefined;
  
//       // set staker to whitelist
//       await xmon.setWhitelist(monStaker.address, true, {from: accounts[0]});
  
//       // add A to the whitelist
//       await xmon.setWhitelist(accounts[0], true, {from: accounts[0]});
  
//       // init tx fee
//       await xmon.setTransferFee(1, {from: accounts[0]});
      
//       // approve stakers for A, B, and C
//       await xmon.approve(monStaker.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 
//       await xmon.approve(monStaker.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[1]}); 
//       await xmon.approve(monStaker.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[2]}); 
  
//       // move 1000 tokens to B and C
//       await xmon.transfer(accounts[1], 1000, {from: accounts[0]});
//       await xmon.transfer(accounts[2], 1000, {from: accounts[0]});
  
//       // set configs
//       await monStaker.setMaxStake(1000, {from: accounts[0]});
//       await monStaker.setMaxMons(100, {from:accounts[0]});
  
//       // set monStaker to be minter
//       await monMinter.setMinterRole(monStaker.address, {from: accounts[0]});
  
//       // Set 1000 max mons
//       await monStaker.setMaxMons(1000, {from: accounts[0]});

//       // Deposit and generate enough DOOM for all the summons below
//       await monStaker.addStake(100, {from: accounts[0]});
//       await monStaker.addStake(100, {from: accounts[1]});
//       await monStaker.addStake(100, {from: accounts[2]});
//       for (let i = 0; i < 10; i++) {
//         await timeMachine.advanceBlock();
//       }
//       await monStaker.removeStake({from: accounts[1]});
//       await monStaker.removeStake({from: accounts[2]});
//       await monStaker.removeStake({from: accounts[0]});

//       // Set baseDoomFee to be 10
//       await monStaker.setBaseDoomFee(10, {from: accounts[0]});
  
//       // Set doomMultiplier to be 1
//       await monStaker.setDoomMultiplier(1, {from: accounts[0]});

//       // A deposits 100 XMON, mints 5 monsters
//       // B deposits 100 XMON, mints 5 monsters
//       // C deposits 100 XMON, mints 5 monsters
//       for (let i = 0; i < 5; i++) {
//         await monStaker.addStake(100, {from: accounts[0]});
//         await monStaker.addStake(100, {from: accounts[1]});
//         await monStaker.addStake(100, {from: accounts[2]});
  
//         await monStaker.claimMon({from: accounts[0]});
//         await monStaker.claimMon({from: accounts[1]});
//         await monStaker.claimMon({from: accounts[2]});
  
//         await monStaker.removeStake({from: accounts[1]});
//         await monStaker.removeStake({from: accounts[2]});
//         await monStaker.removeStake({from: accounts[0]});

//         // Ensure numSummons is going up correctly
//         result = await monStaker.numSummons(accounts[0]);
//         expected = web3.utils.toBN(i+1);
//         expect(expected).to.eql(result);

//         // Ensure doomFee is going up correctly
//         result = await monStaker.doomFee(accounts[0]);
//         expected = web3.utils.toBN(10+i+1);
//         expect(expected).to.eql(result);

//         // Ensure doomFee is being deducted correctly
//       }

//       // Ensure num mons is 15
//       result = await monStaker.numMons();
//       expected = web3.utils.toBN(15);
//       expect(expected).to.eql(result);
  
//       // Ensure that B and C all have the same balances of 1000
//       result = await xmon.balanceOf(accounts[1]);
//       expected = web3.utils.toBN('1000');
//       expect(expected).to.eql(result);
  
//       result = await xmon.balanceOf(accounts[2]);
//       expected = web3.utils.toBN('1000');
//       expect(expected).to.eql(result);

//       // Ensure numSummons of A,B, and C is 5
//       result = await monStaker.numSummons(accounts[0]);
//       expected = web3.utils.toBN(5);
//       expect(result).to.eql(expected);
//       result = await monStaker.numSummons(accounts[1]);
//       expect(result).to.eql(expected);
//       result = await monStaker.numSummons(accounts[2]);
//       expect(result).to.eql(expected);
//     });
//   });

// });