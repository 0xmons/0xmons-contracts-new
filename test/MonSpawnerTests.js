const truffleAssert = require('truffle-assertions');
const xmonArtifact = artifacts.require('./XMON.sol');
const monMinterArtifact = artifacts.require('./MonMinter.sol');
const monStakerArtifact = artifacts.require('./MonStaker.sol');
const monSpawnerArtifact = artifacts.require('./MonSpawner.sol');

contract("monSpawner tests", async accounts => {
  it ("handles setters and permissions correctly", async() => {
    let monSpawner = await monSpawnerArtifact.deployed();
    let xmon = await xmonArtifact.deployed();
    let monMinter = await monMinterArtifact.deployed();

    // Ensure only admin can change the initialDelay
    // Ensure only admin can change the extraDelay
    // Ensure only admin can change the prefixURI
    // Ensure only admin can change the spawnFee

    await monSpawner.setInitialDelay(1, {from: accounts[0]});
    expected = await monSpawner.initialDelay();
    expect(expected).to.eql(web3.utils.toBN('1'));
    await truffleAssert.reverts(
      monSpawner.setInitialDelay(1, {from: accounts[1]})
    )

    await monSpawner.setExtraDelay(2, {from: accounts[0]});
    expected = await monSpawner.extraDelay();
    expect(expected).to.eql(web3.utils.toBN('2'));
    await truffleAssert.reverts(
      monSpawner.setExtraDelay(1, {from: accounts[1]})
    )

    await monSpawner.setPrefixURI('test', {from: accounts[0]});
    expected = await monSpawner.prefixURI();
    expect(expected).to.eql('test');
    await truffleAssert.reverts(
      monSpawner.setPrefixURI('test2', {from: accounts[1]})
    )

    await monSpawner.setSpawnFee(10, {from: accounts[0]});
    expected = await monSpawner.spawnFee();
    expect(expected).to.eql(web3.utils.toBN('10'));
    await truffleAssert.reverts(
      monSpawner.setSpawnFee(10, {from: accounts[1]})
    );

    // Ensure only admin can set xmon
    // Ensure xmon can only be set once
    await truffleAssert.reverts(
      monSpawner.setXMON(xmon.address, {from: accounts[1]})
    );
    await monSpawner.setXMON(xmon.address, {from: accounts[0]});
    await truffleAssert.reverts(
      monSpawner.setXMON(xmon.address, {from: accounts[0]})
    );

    // Ensure only admin can set monMinter
    // Ensure monMinter can only be set once
    await truffleAssert.reverts(
      monSpawner.setMonMinter(monMinter.address, {from: accounts[1]})
    );
    await monSpawner.setMonMinter(monMinter.address, {from: accounts[0]});
    await truffleAssert.reverts(
      monSpawner.setMonMinter(monMinter.address, {from: accounts[0]})
    );

    // Whitelist A
    // Send 10 tokens to monSpawner
    // Ensure only admin can call moveTokens
    // Ensure balanceOf monSpawner is 0
    await xmon.setWhitelist(accounts[0], true, {from: accounts[0]});
    await xmon.transfer(monSpawner.address, 10, {from: accounts[0]});
    expected = await xmon.balanceOf(monSpawner.address);
    expect(expected).to.eql(web3.utils.toBN('10'));
    await truffleAssert.reverts(
      monSpawner.moveTokens(xmon.address, accounts[0], 10, {from: accounts[1]})
    );
    monSpawner.moveTokens(xmon.address, accounts[0], 10, {from: accounts[0]});
    expected = await xmon.balanceOf(monSpawner.address);
    expect(expected).to.eql(web3.utils.toBN('0'));

    // Ensure only admin can grant spawnerAdmin role
    await truffleAssert.reverts(
      monSpawner.setSpawnerAdminRole(accounts[0], {from: accounts[1]})
    );
    await monSpawner.setSpawnerAdminRole(accounts[0], {from: accounts[0]});
  });
});

contract("monSpawner tests", async accounts => {
  it ("does an end to end test correctly of stake -> claimMon -> get two -> spawn", async() => {
    let monSpawner = await monSpawnerArtifact.deployed();
    let xmon = await xmonArtifact.deployed();
    let monMinter = await monMinterArtifact.deployed();
    let monStaker = await monStakerArtifact.deployed();
    let result = undefined;

    // Add staker to whitelist
    await xmon.setWhitelist(monStaker.address, true, {from: accounts[0]});

    // add A to the whitelist
    await xmon.setWhitelist(accounts[0], true, {from: accounts[0]});

    // init tx fee
    await xmon.setTransferFee(1, {from: accounts[0]});

    // set base URI
    await monMinter.setBaseURI("api.com/", {from:accounts[0]});

    // set prefixURI
    await monSpawner.setPrefixURI("spawn/", {from: accounts[0]});

    // init xmon and monMinter contract references
    await monStaker.setXMON(xmon.address, {from: accounts[0]});
    await monStaker.setMonMinter(monMinter.address, {from: accounts[0]});
    await monSpawner.setXMON(xmon.address, {from: accounts[0]});
    await monSpawner.setMonMinter(monMinter.address, {from: accounts[0]});

    // set initalDelay
    await monSpawner.setInitialDelay(100, {from: accounts[0]});
    
    // set extraDelay
    await monSpawner.setExtraDelay(1000, {from: accounts[0]});

    // approve contracts for A
    await xmon.approve(monStaker.address, web3.utils.toBN('9999000000000000000000'), {from: accounts[0]}); 
    await xmon.approve(monSpawner.address, web3.utils.toBN('999999999999999999999999'), {from: accounts[0]});

    // set monStaker to be minter
    await monMinter.setMinterRole(monStaker.address, {from: accounts[0]});
    await monMinter.setMinterRole(monSpawner.address, {from: accounts[0]});

    // Set no startDelay
    await monStaker.setStartDelay(0, {from: accounts[0]});

    // Set 1000 max mons
    await monStaker.setMaxMons(1000, {from: accounts[0]});

    // Claim 3 monsters
    await monStaker.addStake(10, {from: accounts[0]});
    await monStaker.claimMon({from: accounts[0]});
    await monStaker.claimMon({from: accounts[0]});
    await monStaker.claimMon({from: accounts[0]});

    // Breed a new monster (#4)
    await monSpawner.spawnNewMon(1,2);

    // Ensure parents and gen are correct (1 and 2 to make 4)
    let spawnedMon = await monMinter.monRecords(4);
    expect(spawnedMon["parent1"]).to.eql(web3.utils.toBN('1'));
    expect(spawnedMon["parent2"]).to.eql(web3.utils.toBN('2'));
    expect(spawnedMon["gen"]).to.eql(web3.utils.toBN('2'));
    
    // Ensure the full URI is being set correctly
    result = await monMinter.tokenURI(4);
    expect(result).to.eql("api.com/spawn/4");

    // check the monUnlock is at least startDelay for 1 and 2
    // but less than extraDelay
    result = await monSpawner.monUnlock(1);
    let cond1 = result.gt(web3.utils.toBN('100'));
    let cond2 = result.lt(web3.utils.toBN('1000'));
    expect(cond1 && cond2).to.eql(true);

    // ensure spawning fails if the owner doesn't own the monsters
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(1,2, {from: accounts[1]}),
      "Need to own mon1"
    );
    // give mon0 away to B to use as test case
    await monMinter.transferFrom(accounts[0], accounts[1], 0, {from: accounts[0]});
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(1,0, {from: accounts[0]}),
      "Need to own mon2"
    );

    // ensure you can't reuse the same 2 monsters
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(1,2, {from: accounts[0]}),
      "Already spawned with mon1 mon2"
    );
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(2,1, {from: accounts[0]}),
      "Already spawned with mon1 mon2"
    );

    // ensure it fails if one of the monsters are on cooldown
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(2,3, {from: accounts[0]}),
      "mon1 isn't unlocked yet"
    );
    await truffleAssert.reverts(
      monSpawner.spawnNewMon(3,2, {from: accounts[0]}),
      "mon2 isn't unlocked yet"
    );

    // check that spawnerAdmin can reset monUnlock
    await monSpawner.setSpawnerAdminRole(accounts[1], {from: accounts[0]});
    await truffleAssert.reverts(
      monSpawner.setMonUnlock(1, 0, {from:accounts[2]})
    );
    await monSpawner.setMonUnlock(1, 10, {from:accounts[1]});

    result = await monSpawner.monUnlock(1);
    expect(result).to.eql(web3.utils.toBN('10'));

    // check that the monUnlock has extraDelay scale with gen 
    await monSpawner.spawnNewMon(1, 4), {from: accounts[0]};
    spawnedMon = await monMinter.monRecords(5);
    expect(spawnedMon["parent1"]).to.eql(web3.utils.toBN('1'));
    expect(spawnedMon["parent2"]).to.eql(web3.utils.toBN('4'));
    expect(spawnedMon["gen"]).to.eql(web3.utils.toBN('2'));

    // Ensure the full URI is being set correctly
    result = await monMinter.tokenURI(5);
    expect(result).to.eql("api.com/spawn/5");

    // check the monUnlock is at least startDelay + extraDelay
    // but less 2*extraDelay + startDelay
    result = await monSpawner.monUnlock(4);
    cond1 = result.gt(web3.utils.toBN('1100'));
    cond2 = result.lt(web3.utils.toBN('2000'));
    expect(cond1 && cond2).to.eql(true);

    // Ensure that gen is set to be the lower of the two mons (2)
    // when using 5 and 1 to spawn
    await monSpawner.setMonUnlock(1, 10, {from:accounts[1]});
    await monSpawner.spawnNewMon(5, 1, {from: accounts[0]});
    spawnedMon = await monMinter.monRecords(6);
    expect(spawnedMon["parent1"]).to.eql(web3.utils.toBN('5'));
    expect(spawnedMon["parent2"]).to.eql(web3.utils.toBN('1'));
    expect(spawnedMon["gen"]).to.eql(web3.utils.toBN('2'));

    // Ensure that gen is set to be the lower of the two mons (3)
    // when using 5 and 6 to spawn
    await monSpawner.setMonUnlock(5, 10, {from:accounts[1]});
    await monSpawner.spawnNewMon(5, 6, {from: accounts[0]});
    spawnedMon = await monMinter.monRecords(7);
    expect(spawnedMon["parent1"]).to.eql(web3.utils.toBN('5'));
    expect(spawnedMon["parent2"]).to.eql(web3.utils.toBN('6'));
    expect(spawnedMon["gen"]).to.eql(web3.utils.toBN('3'));
  });
});