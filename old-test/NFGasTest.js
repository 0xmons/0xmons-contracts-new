// Allows minting with the correct gas price
// mints fail if the gas price is wrong
// transfers failf if the gas price is wrong
// subsequent mints/transfers in a row (with correct prices) will work as intended

const truffleAssert = require('truffle-assertions');
const nfgasArtifact = artifacts.require('./NFGas.sol');
const gwei = 1000000000;

contract("NFGas generation", async accounts => {
  it ("makes images", async() =>{
    let nfgas = await nfgasArtifact.deployed();
    let img = await nfgas.svg(10);
    console.log(img)
  })
});

contract("NFGas tests", async accounts => {
  it ("allows minting at the right gas price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
  });
});

contract("NFGas tests", async accounts => {
  it ("reverts if minting two at the same ID", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
    await truffleAssert.reverts(
      nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')})
    )
  });
});

contract("NFGas tests", async accounts => {
  it ("reverts if gas price is wrong", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await truffleAssert.reverts(
      nfgas.mint(1, {from: accounts[0], gasPrice: 10*gwei, value: web3.utils.toWei('0.1', 'ether')}),
      "Exact gas"
    );
  });
});

contract("NFGas tests", async accounts => {
  it ("reverts if there is no payment", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await truffleAssert.reverts(
      nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei}),
      "Pay fee"
    );
  });
});

contract("NFGas tests", async accounts => {
  it ("reverts if id is too high", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await truffleAssert.reverts(
      nfgas.mint(1025, {from: accounts[0], gasPrice: 1025*gwei, value: web3.utils.toWei('0.1', 'ether')}),
      "Too high"
    );
  });
});

contract("NFGas tests", async accounts => {
  it ("allows minting many at the right price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    for (let i = 1; i < 10; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
    }
    for (let i = 100; i < 110; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
    }
    let svg = await nfgas.svg(1);
    console.log(svg);
  });
});


contract("NFGas tests", async accounts => {
  it ("allows transfers at the right gas price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
    await nfgas.transferFrom(accounts[0], accounts[1], 1, {from: accounts[0], gasPrice: 1*gwei});
  });
});

contract("NFGas tests", async accounts => {
  it ("allows safe transfers at the right gas price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
    await nfgas.safeTransferFrom(accounts[0], accounts[1], 1, {from: accounts[0], gasPrice: 1*gwei});
  });
});


contract("NFGas tests", async accounts => {
  it ("reverts transfers at the wrong gas price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
    await truffleAssert.reverts(
      nfgas.transferFrom(accounts[0], accounts[1], 1, {from: accounts[0], gasPrice: 10*gwei})
    );
  });
});

contract("NFGas tests", async accounts => {
  it ("reverts safe transfers at the wrong gas price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    await nfgas.mint(1, {from: accounts[0], gasPrice: 1*gwei, value: web3.utils.toWei('0.1', 'ether')});
    await truffleAssert.reverts(
      nfgas.safeTransferFrom(accounts[0], accounts[1], 1, {from: accounts[0], gasPrice: 10*gwei})
    );
  });
});

contract("NFGas tests", async accounts => {
  it ("allows minting/transfers for many at the right price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    for (let i = 1; i < 10; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
      await nfgas.transferFrom(accounts[0], accounts[1], i, {from: accounts[0], gasPrice: i*gwei});
    }
    for (let i = 100; i < 110; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
      await nfgas.transferFrom(accounts[0], accounts[1], i, {from: accounts[0], gasPrice: i*gwei});
    }
  });
});

contract("NFGas tests", async accounts => {
  it ("allows minting/safe transfers for many at the right price", async() => {
    let nfgas = await nfgasArtifact.deployed();
    for (let i = 1; i < 10; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
      await nfgas.safeTransferFrom(accounts[0], accounts[1], i, {from: accounts[0], gasPrice: i*gwei});
    }
    for (let i = 100; i < 110; i++) {
      await nfgas.mint(i, {from: accounts[0], gasPrice: i*gwei, value: web3.utils.toWei('0.1', 'ether')});
      await nfgas.safeTransferFrom(accounts[0], accounts[1], i, {from: accounts[0], gasPrice: i*gwei});
    }
  });
});