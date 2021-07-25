const truffleAssert = require('truffle-assertions');
const RegenzArtifact = artifacts.require('./Regenz.sol');

contract("Simple tests", async accounts => {

  let Regenz;

  beforeEach(async() => {
    Regenz = await RegenzArtifact.deployed();
  });

  it ("allows owners to reserve", async() => {
    await Regenz.reserveRegenz(10, {from: accounts[0]});
    expect(await Regenz.balanceOf(accounts[0])).to.eql(web3.utils.toBN(10));
  });

  it ("fails if someone else tries to reserve", async() => {
    await truffleAssert.reverts(
      Regenz.reserveRegenz(10, {from: accounts[1]})
    );
  });

  it ("fails if done during the sale being active", async() => {
    await Regenz.flipSaleState({from: accounts[0]});
    await truffleAssert.reverts(
      Regenz.reserveRegenz(10, {from: accounts[0]}),
      "Cannot reserve during sale"
    );
  });

  it ("only allows owner to toggle sale active", async() => {
    await truffleAssert.reverts(
      Regenz.flipSaleState({from: accounts[1]})
    )
  });

  // fails if eth sent isn't enough
  // fails if sale is done
  // fails if buying too many
  // fails if buying exceeds supply
  // allows buying up to total supply
  // allows claiming eth


});
