const timeTravel = require("../helpers/timeTravel");
const truffleAssert = require('truffle-assertions');
const Test721Artifact = artifacts.require('./Test721.sol');
const Test20Artifact = artifacts.require('./Test20.sol');
const TestDistributorArtifact = artifacts.require('./TestDistributor.sol');
const NFTLotteryPoolArtifact = artifacts.require('./NFTLotteryPool.sol');
const NFTLotteryPoolFactoryArtifact = artifacts.require('./NFTLotteryPoolFactory.sol');

contract("NFTLotteryPool/Factory tests", async accounts => {
  
  let Test20, Test721, TestDistributor, NFTLotteryPool, NFTLotteryPoolFactory;
  let prizeId = 0;

  beforeEach(async () => {
    // Set up all contracts
    Test721 = await Test721Artifact.deployed();
    Test20 = await Test20Artifact.deployed();
    TestDistributor = await TestDistributorArtifact.deployed();
    NFTLotteryPool = await NFTLotteryPoolArtifact.deployed();
    NFTLotteryPoolFactory = await NFTLotteryPoolFactoryArtifact.deployed();

    // Mint NFT ID 1 to accounts[0], approve the PoolFactory to spend it
    await Test721.mint(accounts[0]);
    await Test721.setApprovalForAll(NFTLotteryPoolFactory.address, {from: accounts[0]});

    // Mint 2 "LINK" tokens to accounts[0], approve the PoolFactory to spend it
    await Test20.mint(accounts[0], web3.utils.toWei('2.0', 'ether'));
    await Test20.approve(NFTLotteryPoolFactory.address, web3.utils.toWei('2.0', 'ether'), {from: accounts[0]});

    // Increment NFT ID
    prizeId = prizeId + 1;
  });

  it ("allows clone deployments", async() => {
    let lotteryPool = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, 1, 0, 1, 0, 1, 1, 1, 
      {
        value: web3.utils.toWei('0.1', 'ether')
      }
    );
  });

  it ("reverts if there isn't enough ETH paid", async() =>{
    await truffleAssert.reverts(
      NFTLotteryPoolFactory.createNFTLotteryPool(
        Test721.address, 1, 0, 1, 0, 1, 1, 1, { value: web3.utils.toWei('0.01', 'ether')}
      )
      ,
      "Pay fee"
    );
  });

  it ("allows owner to claim the ETH paid to the factory", async() => {
    await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, prizeId, 0, 1, 0, 1, 1, 1, 
      {
        from: accounts[0],
        value: web3.utils.toWei('0.1', 'ether')
      }
    );
    let poolBalance = await web3.eth.getBalance(NFTLotteryPoolFactory.address);
    await NFTLotteryPoolFactory.claimETH({from: accounts[0]});
    poolBalance = await web3.eth.getBalance(NFTLotteryPoolFactory.address);
    expect(poolBalance).to.eql('0');
  });


  it ("reverts if someone not the owner tries to claim ETH paid to the factory", async() => {
    await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, prizeId, 0, 1, 0, 1, 1, 1, 
      {
        from: accounts[0],
        value: web3.utils.toWei('0.1', 'ether')
      }
    );
    await truffleAssert.reverts(
      NFTLotteryPoolFactory.claimETH({from: accounts[1]})
    );
  })

  // Buying:
  // Allows people to buy, and ETH is deducted correctly [x]
  // Reverts if time is up [x]
  // Reverts if minting would exceed total supply
  // Reverts if address would hold more than maxPerAddress
  // Reverts if sending the wrong amount of ETH (too low)
  // Reverts if sending the wrong amount of ETH (too high)

  it ("allows people to buy tickets and deducts price correctly", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 3600;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    let lotteryBalance = await web3.eth.getBalance(lotteryAddress);
    expect(lotteryBalance).to.eql(web3.utils.toWei('0.01', 'ether'));
  });

  it ("allows people to buy multiple tickets and deducts price correctly", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 3600;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      10, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(10, {from: accounts[1], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryBalance = await web3.eth.getBalance(lotteryAddress);
    expect(lotteryBalance).to.eql(web3.utils.toWei('0.1', 'ether'));
    let ticketBalance = await lotteryPool.balanceOf(accounts[1]);
    expect(ticketBalance).to.eql(web3.utils.toBN(10));
  });

  it ("reverts if buying past the end time", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now - 1;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await truffleAssert.reverts(
      lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')}),
      "Lottery over"
    );
  });

  it ("reverts if minting would exceed max tickets to hold", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now - 1;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      10, // uint32 _maxTickets
      3, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await truffleAssert.reverts(
      lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')}),
      "Holding too many"
    );
  });

  it ("reverts if minting would exceed max tickets to sell", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now - 1;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      3, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await truffleAssert.reverts(
      lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')}),
      "Exceeds max supply"
    );
  });

  it ("reverts if ETH sent is too high", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now - 1;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      3, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await truffleAssert.reverts(
      lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')}),
      "Price incorrect"
    );
  });

  it ("reverts if ETH sent is too low", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now - 1;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      3, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await truffleAssert.reverts(
      lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.001', 'ether')}),
      "Price incorrect"
    );
  });

  // Prize distribution
  // Prize can be distributed
  // Reverts if lottery still ongoing
  // Reverts if minimum number of tickets was not sold

  it ("allows prizes to be distributed after time is up", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    await TestDistributor.setRecipient(accounts[1]);
    await timeTravel.advanceTime(61);
    await lotteryPool.distributePrize({from: accounts[0]});
    let owner = await Test721.ownerOf(prizeId);
    expect(owner).to.eql(accounts[1]);
  });

  it ("reverts if time is not up", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    await TestDistributor.setRecipient(accounts[1]);
    await truffleAssert.reverts(
      lotteryPool.distributePrize({from: accounts[0]}),
      "Lottery not over"
    );
  });

  it ("reverts if min tickets not sold", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    await TestDistributor.setRecipient(accounts[1]);
    await timeTravel.advanceTime(61);
    await truffleAssert.reverts(
      lotteryPool.distributePrize({from: accounts[0]}),
      "Not enough tickets sold"
    );
  });

  // Refunds
  // Refund works if min tickets not sold and time is up [x]
  // Refund calculates amount correctly for multiple ids [x]
  // Refund reverts if called from an address that doesn't own one of the ids [x]
  // Refund reverts if time is not up [x]
  // Refund reverts if time is up but over or equal to min tickets were sold [x]
  // Unlocking works if time is over plus 1 week and prize is still in the pool [x]
  // Unlocking reverts if time is not over plus 1 week [x]
  // Unlocking reverts if time is over plus 1 week but prize is not in the pool [x]
  // Refund works if unlock is set [x]

  // Obvious distribution logic checks

  it ("refunds ETH if min tickets were not sold and time is past the end", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    await timeTravel.advanceTime(61);

    // Balance of lottery before should be non-zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.not.eql(web3.utils.toBN(0));

    // Get refund
    await lotteryPool.getRefund([1], {from: accounts[1]});

    // Balance of lottery after refund should be zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.eql('0');
  });

  it ("allows anyone to unlock refunds if over 1 week passes and the prize is still in the pool", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});

    // Add 1 week
    await timeTravel.advanceTime(604861);

    await lotteryPool.unlockRefund({from: accounts[1]});
  });

  it ("reverts unlocking if not 1 week has passed since end date", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});

    // Add 1 week
    await timeTravel.advanceTime(604800);

    await truffleAssert.reverts(
      lotteryPool.unlockRefund({from: accounts[1]}),
      "Too early"
    );
  });

  it ("reverts unlocking if over 1 week has passed but the prize is no longer in the lottery pool", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      0, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});
    await TestDistributor.setRecipient(accounts[1]);
    await timeTravel.advanceTime(604900);
    await lotteryPool.distributePrize({from: accounts[0]});
    await truffleAssert.reverts(
      lotteryPool.unlockRefund({from: accounts[1]}),
      "Already VRFed"
    )
  });

  it ("allows anyone to unlock refunds if over 1 week passes and the prize is still in the pool and refunding should work", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});

    // Add 1 week
    await timeTravel.advanceTime(604861);

    await lotteryPool.unlockRefund({from: accounts[1]});

    // Balance of lottery before should be non-zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.not.eql(web3.utils.toBN(0));

    // Get refund
    await lotteryPool.getRefund([1], {from: accounts[1]});

    // Balance of lottery after refund should be zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.eql('0');
  });

  it ("refunds ETH correctly for multiple tickets", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await timeTravel.advanceTime(61);

    // Balance of lottery before should be non-zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.not.eql(web3.utils.toBN(0));

    // Get refund for all items
    await lotteryPool.getRefund([1,2,3,4,5], {from: accounts[1]});

    // Balance of lottery after refund should be zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.eql('0');
  });

  it ("reverts refunds if the owner doesn't own all of the tickets", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);

    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await lotteryPool.buyTickets(1, {from: accounts[0], value: web3.utils.toWei('0.01', 'ether')});

    await timeTravel.advanceTime(61);

    // Balance of lottery before should be non-zero
    expect(await web3.eth.getBalance(lotteryPool.address)).to.not.eql(web3.utils.toBN(0));

    // Get refund for all items
    await truffleAssert.reverts(
      lotteryPool.getRefund([1,2,3,4,5,6], {from: accounts[1]}),
      "Not owner"
    );
  });

  it ("reverts refunds if the lottery isn't over", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await truffleAssert.reverts(
      lotteryPool.getRefund([1], {from: accounts[1]}),
      "Lottery not over"
    )
  });  

  it ("reverts refunds if at least the min number of tickets were minted", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await timeTravel.advanceTime(61);
    await truffleAssert.reverts(
      lotteryPool.getRefund([1], {from: accounts[1]}),
      "Enough tickets sold"
    );
  });  

  // Refunding owner
  // Refunding LINK/NFT back to owner works if min tickets not sold and time is up [x]
  // Refunding LINK/NFT reverts if time is not up [x]
  // Refunding LINK/NFT reverts if time is up but over or equal to min tickets were [x]
  // Refunding LINK/NFT works if unlocked [x]

  it ("refunds owner assets if time is up and min tickets not sold", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await timeTravel.advanceTime(61);
    await lotteryPool.refundOwnerAssets({from: accounts[0]});
    expect(await Test20.balanceOf(lotteryPool.address)).to.eql(web3.utils.toBN(0));
    expect(await Test721.ownerOf(prizeId)).to.eql(accounts[0]);
  });

  it ("reverts refunding owner assets if time is not up", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await timeTravel.advanceTime(10);
    await truffleAssert.reverts(
      lotteryPool.refundOwnerAssets({from: accounts[0]}),
      "Lottery not over"
    );
  });

  it ("reverts refunding owner assets if time is up but at least min tickets sold", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      1, // uint32 _minTicketsToSell
      20, // uint32 _maxTickets
      10, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(5, {from: accounts[1], value: web3.utils.toWei('0.05', 'ether')});
    await timeTravel.advanceTime(61);
    await truffleAssert.reverts(
      lotteryPool.refundOwnerAssets({from: accounts[0]}),
      "Enough tickets sold"
    );
  });

  it ("allows anyone to unlock refunds if over 1 week passes and the prize is still in the pool and owner assets can then be unlocked", async() =>{
    let now = (await web3.eth.getBlock("latest")).timestamp;
    let end = now + 60;
    let lotteryPoolTx = await NFTLotteryPoolFactory.createNFTLotteryPool(
      Test721.address, // address _prizeAddress
      prizeId, // uint256 _prizeId
      now, // uint64 startDate
      end, // uint64 endDate
      10, // uint32 _minTicketsToSell
      1, // uint32 _maxTickets
      1, // uint32 _maxTicketsPerAddress
      web3.utils.toWei('0.01', 'ether'), // uint256 _ticketPrice
      { from: accounts[0], value: web3.utils.toWei('0.1', 'ether')});
    let lotteryAddress = lotteryPoolTx.logs[0]["address"];
    let lotteryPool = await NFTLotteryPoolArtifact.at(lotteryAddress);
    await lotteryPool.buyTickets(1, {from: accounts[1], value: web3.utils.toWei('0.01', 'ether')});

    // Add 1 week
    await timeTravel.advanceTime(604861);

    await lotteryPool.unlockRefund({from: accounts[1]});

    await lotteryPool.refundOwnerAssets({from: accounts[0]});
    expect(await Test20.balanceOf(lotteryPool.address)).to.eql(web3.utils.toBN(0));
    expect(await Test721.ownerOf(prizeId)).to.eql(accounts[0]);
  });

});